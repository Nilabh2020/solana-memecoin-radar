import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Verify Supabase JWT and attach user to request.
 * Expects: Authorization: Bearer <access_token>
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

/**
 * Optional auth — attaches user if token present, continues without if not.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    req.user = error ? null : user;
  } catch {
    req.user = null;
  }

  next();
}
