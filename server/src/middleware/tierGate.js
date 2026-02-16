import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Check user tier from DB. Auto-expire if past tier_expires_at.
 * Attaches req.profile with current tier info.
 * If tier !== 'premium', returns 403.
 */
export async function tierGate(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tier, tier_expires_at, lifetime')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ success: false, error: 'Profile not found' });
    }

    // Auto-expire: if not lifetime and expired, downgrade
    if (
      profile.tier === 'premium' &&
      !profile.lifetime &&
      profile.tier_expires_at &&
      new Date(profile.tier_expires_at) < new Date()
    ) {
      await supabase
        .from('profiles')
        .update({ tier: 'free', updated_at: new Date().toISOString() })
        .eq('id', req.user.id);

      profile.tier = 'free';
      logger.info('Auto-expired premium tier', { userId: req.user.id });
    }

    req.profile = profile;

    if (profile.tier !== 'premium') {
      return res.status(403).json({ success: false, error: 'Premium subscription required' });
    }

    next();
  } catch (err) {
    logger.error('Tier gate error', { error: err.message, userId: req.user?.id });
    return res.status(500).json({ success: false, error: 'Failed to verify subscription' });
  }
}

/**
 * Lightweight tier check that attaches profile but does NOT block free users.
 * Used for routes that serve different data based on tier.
 */
export async function attachTier(req, res, next) {
  if (!req.user) {
    req.profile = { tier: 'free', lifetime: false, tier_expires_at: null };
    return next();
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tier, tier_expires_at, lifetime')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      req.profile = { tier: 'free', lifetime: false, tier_expires_at: null };
      return next();
    }

    // Auto-expire
    if (
      profile.tier === 'premium' &&
      !profile.lifetime &&
      profile.tier_expires_at &&
      new Date(profile.tier_expires_at) < new Date()
    ) {
      await supabase
        .from('profiles')
        .update({ tier: 'free', updated_at: new Date().toISOString() })
        .eq('id', req.user.id);

      profile.tier = 'free';
      logger.info('Auto-expired premium tier', { userId: req.user.id });
    }

    req.profile = profile;
    next();
  } catch {
    req.profile = { tier: 'free', lifetime: false, tier_expires_at: null };
    next();
  }
}
