import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { verifyPayment, getPaymentHistory } from '../services/paymentService.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /api/payments/verify — Verify a Solana payment and grant premium.
 * Body: { tx_signature: string, plan_type: 'monthly' | 'lifetime' }
 */
router.post('/verify', authMiddleware, async (req, res) => {
  // Soft launch gate
  if (!env.premiumEnabled) {
    // Allow internal testing with secret header
    const testHeader = req.headers['x-premium-test'];
    if (testHeader !== env.premiumTestSecret) {
      return res.status(503).json({
        success: false,
        error: 'Payments coming soon! Premium features are not yet available.',
      });
    }
  }

  const { tx_signature, plan_type } = req.body;

  if (!tx_signature || typeof tx_signature !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing tx_signature' });
  }

  if (!['monthly', 'lifetime'].includes(plan_type)) {
    return res.status(400).json({ success: false, error: 'Invalid plan_type. Must be "monthly" or "lifetime"' });
  }

  // Basic signature format validation (base58, 86-88 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{86,88}$/.test(tx_signature)) {
    return res.status(400).json({ success: false, error: 'Invalid transaction signature format' });
  }

  logger.info('Payment verification requested', {
    userId: req.user.id,
    txSignature: tx_signature,
    planType: plan_type,
  });

  const result = await verifyPayment(req.user.id, tx_signature, plan_type);

  if (result.success) {
    res.json({ success: true, data: result });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

/**
 * GET /api/payments/history — Get user's payment history.
 */
router.get('/history', authMiddleware, async (req, res) => {
  const payments = await getPaymentHistory(req.user.id);
  res.json({ success: true, data: payments });
});

/**
 * GET /api/payments/pricing — Get current pricing info.
 */
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      beta_mode: env.betaMode,
      premium_enabled: env.premiumEnabled,
      monthly_price_sol: env.monthlyPrice,
      lifetime_price_sol: env.lifetimePrice,
      payment_wallet: env.paymentWalletAddress,
    },
  });
});

export default router;
