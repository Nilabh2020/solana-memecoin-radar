import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import supabase from '../config/supabase.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const connection = new Connection(env.heliusRpcUrl, 'finalized');
const RECIPIENT_PUBKEY = new PublicKey(env.paymentWalletAddress);

// Max age for a valid transaction: 2 hours
const MAX_TX_AGE_SECONDS = 2 * 60 * 60;

/**
 * Verify a Solana payment transaction and grant premium tier.
 */
export async function verifyPayment(userId, txSignature, planType) {
  const auditLog = {
    userId,
    txSignature,
    planType,
    checks: {},
    timestamp: new Date().toISOString(),
  };

  try {
    // Determine required amount
    const requiredAmount = planType === 'lifetime'
      ? env.lifetimePrice
      : env.monthlyPrice;

    // 1. Check if tx signature already used
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('tx_signature', txSignature)
      .single();

    if (existing) {
      auditLog.checks.uniqueSignature = false;
      await savePaymentRecord(userId, txSignature, 0, planType, 'rejected', null, auditLog);
      return { success: false, error: 'Transaction signature already used' };
    }
    auditLog.checks.uniqueSignature = true;

    // 2. Fetch parsed transaction
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      auditLog.checks.txExists = false;
      await savePaymentRecord(userId, txSignature, 0, planType, 'failed', null, auditLog);
      return { success: false, error: 'Transaction not found. It may still be processing — wait a minute and retry.' };
    }
    auditLog.checks.txExists = true;

    // 3. Check for execution error
    if (tx.meta?.err !== null) {
      auditLog.checks.noError = false;
      auditLog.txError = tx.meta?.err;
      await savePaymentRecord(userId, txSignature, 0, planType, 'failed', tx.blockTime, auditLog);
      return { success: false, error: 'Transaction failed on-chain' };
    }
    auditLog.checks.noError = true;

    // 4. Check confirmation status
    const confirmationStatus = tx.meta?.confirmationStatus || 'unknown';
    auditLog.checks.confirmationStatus = confirmationStatus;
    if (confirmationStatus !== 'finalized') {
      await savePaymentRecord(userId, txSignature, 0, planType, 'pending', tx.blockTime, auditLog);
      return { success: false, error: 'Transaction not yet finalized. Please wait and retry.' };
    }

    // 5. Check block time (within 2 hours)
    const now = Math.floor(Date.now() / 1000);
    const txAge = now - (tx.blockTime || 0);
    auditLog.checks.blockTime = tx.blockTime;
    auditLog.checks.txAgeSeconds = txAge;

    if (txAge > MAX_TX_AGE_SECONDS) {
      auditLog.checks.withinTimeLimit = false;
      await savePaymentRecord(userId, txSignature, 0, planType, 'rejected', tx.blockTime, auditLog);
      return { success: false, error: 'Transaction is too old (must be within 2 hours)' };
    }
    auditLog.checks.withinTimeLimit = true;

    // 6. Find SOL transfer to our recipient in the transaction
    const transferAmount = findTransferToRecipient(tx);
    auditLog.checks.transferAmount = transferAmount;

    if (transferAmount === null) {
      auditLog.checks.recipientMatch = false;
      await savePaymentRecord(userId, txSignature, 0, planType, 'rejected', tx.blockTime, auditLog);
      return { success: false, error: 'No SOL transfer to the correct recipient found in this transaction' };
    }
    auditLog.checks.recipientMatch = true;

    // 7. Check amount
    if (transferAmount < requiredAmount) {
      auditLog.checks.amountSufficient = false;
      auditLog.checks.requiredAmount = requiredAmount;
      await savePaymentRecord(userId, txSignature, transferAmount, planType, 'rejected', tx.blockTime, auditLog);
      return {
        success: false,
        error: `Insufficient payment. Sent ${transferAmount} SOL, required ${requiredAmount} SOL`,
      };
    }
    auditLog.checks.amountSufficient = true;

    // All checks passed — save payment and upgrade user
    await savePaymentRecord(userId, txSignature, transferAmount, planType, 'verified', tx.blockTime, auditLog);

    // Calculate expiration
    const isLifetime = planType === 'lifetime';
    const tierExpiresAt = isLifetime
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Update user profile
    await supabase
      .from('profiles')
      .update({
        tier: 'premium',
        tier_expires_at: tierExpiresAt,
        lifetime: isLifetime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    logger.info('Payment verified and premium granted', {
      userId,
      txSignature,
      planType,
      amount: transferAmount,
    });

    return {
      success: true,
      tier: 'premium',
      plan_type: planType,
      expires_at: tierExpiresAt,
      lifetime: isLifetime,
    };
  } catch (err) {
    logger.error('Payment verification error', {
      error: err.message,
      userId,
      txSignature,
    });
    auditLog.error = err.message;
    await savePaymentRecord(userId, txSignature, 0, planType, 'failed', null, auditLog).catch(() => {});
    return { success: false, error: 'Payment verification failed. Please try again.' };
  }
}

/**
 * Find SOL transfer amount to our recipient wallet in a parsed transaction.
 */
function findTransferToRecipient(tx) {
  const instructions = tx.transaction?.message?.instructions || [];
  const recipientStr = RECIPIENT_PUBKEY.toBase58();

  for (const ix of instructions) {
    // Check parsed system program transfers
    if (
      ix.program === 'system' &&
      ix.parsed?.type === 'transfer' &&
      ix.parsed?.info?.destination === recipientStr
    ) {
      return ix.parsed.info.lamports / LAMPORTS_PER_SOL;
    }
  }

  // Also check inner instructions
  const innerInstructions = tx.meta?.innerInstructions || [];
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions || []) {
      if (
        ix.program === 'system' &&
        ix.parsed?.type === 'transfer' &&
        ix.parsed?.info?.destination === recipientStr
      ) {
        return ix.parsed.info.lamports / LAMPORTS_PER_SOL;
      }
    }
  }

  return null;
}

/**
 * Save payment record to Supabase for audit trail.
 */
async function savePaymentRecord(userId, txSignature, amount, planType, status, blockTime, auditLog) {
  try {
    await supabase.from('payments').insert({
      user_id: userId,
      tx_signature: txSignature,
      amount_sol: amount,
      tier_granted: status === 'verified' ? 'premium' : 'none',
      plan_type: planType,
      status,
      block_time: blockTime,
      verification_result: auditLog,
      verified_at: status === 'verified' ? new Date().toISOString() : null,
    });
  } catch (err) {
    logger.error('Failed to save payment record', { error: err.message, txSignature });
  }
}

/**
 * Get payment history for a user.
 */
export async function getPaymentHistory(userId) {
  const { data, error } = await supabase
    .from('payments')
    .select('id, tx_signature, amount_sol, plan_type, status, verified_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    logger.error('Failed to fetch payment history', { error: error.message, userId });
    return [];
  }

  return data;
}
