/**
 * Backend Logger Utility
 * 
 * Centralized logging system with environment-based level control.
 * Reads log level from LOG_LEVEL env var (default: 'error')
 * 
 * Log Levels (hierarchy): debug (4) < info (3) < warn (2) < error (1) < none (0)
 * 
 * Usage:
 *   import logger from './src/utils/logger.js'
 *   logger.debug('ContextName', 'Detailed message', {data})
 *   logger.info('ContextName', 'Event occurred', {data})
 *   logger.warn('ContextName', 'Warning message', {data})
 *   logger.error('ContextName', 'Error occurred', {error, code, data})
 */

const LOG_LEVELS = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

// Get current log level from environment
const getLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL || 'error';
  return LOG_LEVELS[envLevel] || LOG_LEVELS.error;
};

const currentLevel = getLogLevel();

/**
 * Format timestamp in ISO format
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Base logging function for server (no colors)
 */
const log = (level, levelName, context, message, data) => {
  if (currentLevel < level) return;

  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${context}] ${levelName}:`;
  
  if (data && Object.keys(data).length > 0) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    console.log(`${prefix} ${message}`, dataStr);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

const logger = {
  debug: (context, message, data) => log(LOG_LEVELS.debug, 'DEBUG', context, message, data),
  info: (context, message, data) => log(LOG_LEVELS.info, 'INFO', context, message, data),
  warn: (context, message, data) => log(LOG_LEVELS.warn, 'WARN', context, message, data),
  error: (context, message, data) => log(LOG_LEVELS.error, 'ERROR', context, message, data),
};

export default logger;
