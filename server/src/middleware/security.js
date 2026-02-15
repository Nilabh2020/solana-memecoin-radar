import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

export function setupSecurity(app) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Let frontend handle CSP
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
    },
  });

  app.use('/api/', limiter);

  // Disable X-Powered-By
  app.disable('x-powered-by');
}
