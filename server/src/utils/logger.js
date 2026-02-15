const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[currentLevel];
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

const logger = {
  error(message, meta) {
    if (shouldLog('error')) console.error(formatMessage('error', message, meta));
  },
  warn(message, meta) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  info(message, meta) {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  debug(message, meta) {
    if (shouldLog('debug')) console.log(formatMessage('debug', message, meta));
  },
};

export default logger;
