import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * GET /api/auth/me — Get current user profile with tier info.
 * Auto-expires premium if past tier_expires_at.
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Auto-expire check
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
      logger.info('Auto-expired premium tier via /me', { userId: req.user.id });
    }

    res.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        tier: profile.tier,
        tier_expires_at: profile.tier_expires_at,
        lifetime: profile.lifetime,
        created_at: profile.created_at,
      },
    });
  } catch (err) {
    logger.error('Error fetching profile', { error: err.message, userId: req.user.id });
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/auth/subscription — Get subscription details.
 */
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tier, tier_expires_at, lifetime')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.json({ success: true, data: { tier: 'free', lifetime: false, tier_expires_at: null } });
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
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    logger.error('Error fetching subscription', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
});

export default router;
