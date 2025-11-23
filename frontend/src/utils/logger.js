/**
 * Frontend Logger Utility
 * 
 * Centralized logging system with environment-based level control.
 * Reads log level from VITE_LOG_LEVEL env var (default: 'error')
 * 
 * Log Levels (hierarchy): debug (4) < info (3) < warn (2) < error (1) < none (0)
 * 
 * Usage:
 *   import logger from '@/utils/logger.js'
 *   logger.debug('ComponentName', 'Detailed message', {data})
 *   logger.info('ComponentName', 'Event occurred', {data})
 *   logger.warn('ComponentName', 'Warning message', {data})
 *   logger.error('ComponentName', 'Error occurred', {error, code, data})
 */

const LOG_LEVELS = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const LOG_COLORS = {
  debug: 'color: #888; font-weight: bold;',
  info: 'color: #0066cc; font-weight: bold;',
  warn: 'color: #ff9900; font-weight: bold;',
  error: 'color: #cc0000; font-weight: bold;',
};

// Get current log level from environment
const getLogLevel = () => {
  const envLevel = import.meta.env.VITE_LOG_LEVEL || 'error';
  return LOG_LEVELS[envLevel] || LOG_LEVELS.error;
};

const currentLevel = getLogLevel();

/**
 * Format timestamp in ISO format
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Base logging function
 */
const log = (level, levelName, context, message, data) => {
  if (currentLevel < level) return;

  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${context}] ${levelName}:`;

  if (data && Object.keys(data).length > 0) {
    console.log(`%c${prefix}`, LOG_COLORS[levelName], message, data);
  } else {
    console.log(`%c${prefix}`, LOG_COLORS[levelName], message);
  }
};

const logger = {
  debug: (context, message, data) => log(LOG_LEVELS.debug, 'DEBUG', context, message, data),
  info: (context, message, data) => log(LOG_LEVELS.info, 'INFO', context, message, data),
  warn: (context, message, data) => log(LOG_LEVELS.warn, 'WARN', context, message, data),
  error: (context, message, data) => log(LOG_LEVELS.error, 'ERROR', context, message, data),
};

export default logger;
