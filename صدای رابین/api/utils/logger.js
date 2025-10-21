/**
 * سیستم لاگ‌گیری برای دیباگ و مانیتورینگ
 */

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // قرمز
  WARN: '\x1b[33m',  // زرد
  INFO: '\x1b[36m',  // آبی
  DEBUG: '\x1b[37m', // سفید
  RESET: '\x1b[0m'
};

class Logger {
  constructor(module = 'SYSTEM') {
    this.module = module;
    this.logLevel = process.env.LOG_LEVEL || process.env.RABIN_VOICE_LOG_LEVEL || 'INFO';

    // Setup log file
    this.logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `rabin-voice-${today}.log`);
  }

  formatMessage(level, message, data = null, withColor = true) {
    const timestamp = new Date().toISOString();
    const color = withColor ? LOG_COLORS[level] : '';
    const reset = withColor ? LOG_COLORS.RESET : '';

    let logMessage = `${color}[${timestamp}] [${level}] [${this.module}] ${message}${reset}`;

    if (data) {
      logMessage += `\n${color}Data: ${JSON.stringify(data, null, 2)}${reset}`;
    }

    return logMessage;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8');
    } catch (error) {
      // Fail silently to avoid infinite loop
      console.error('Failed to write to log file:', error.message);
    }
  }

  shouldLog(level) {
    const currentLevel = LOG_LEVELS[this.logLevel] || LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level];
    return messageLevel <= currentLevel;
  }

  error(message, data = null) {
    if (this.shouldLog('ERROR')) {
      const coloredMessage = this.formatMessage('ERROR', message, data, true);
      const plainMessage = this.formatMessage('ERROR', message, data, false);
      console.error(coloredMessage);
      this.writeToFile(plainMessage);
    }
  }

  warn(message, data = null) {
    if (this.shouldLog('WARN')) {
      const coloredMessage = this.formatMessage('WARN', message, data, true);
      const plainMessage = this.formatMessage('WARN', message, data, false);
      console.warn(coloredMessage);
      this.writeToFile(plainMessage);
    }
  }

  info(message, data = null) {
    if (this.shouldLog('INFO')) {
      const coloredMessage = this.formatMessage('INFO', message, data, true);
      const plainMessage = this.formatMessage('INFO', message, data, false);
      console.log(coloredMessage);
      this.writeToFile(plainMessage);
    }
  }

  debug(message, data = null) {
    if (this.shouldLog('DEBUG')) {
      const coloredMessage = this.formatMessage('DEBUG', message, data, true);
      const plainMessage = this.formatMessage('DEBUG', message, data, false);
      console.log(coloredMessage);
      this.writeToFile(plainMessage);
    }
  }

  // متدهای خاص برای دیتابیس
  dbQuery(query, params = []) {
    this.debug('🔍 Database Query', { query, params });
  }

  dbResult(rowCount, executionTime = null) {
    this.info(`✅ Query executed successfully, rows: ${rowCount}`,
      executionTime ? { executionTime: `${executionTime}ms` } : null);
  }

  dbError(error, query = null) {
    this.error('❌ Database Error', {
      error: error.message,
      query: query || 'Unknown query',
      stack: error.stack
    });
  }

  // متدهای خاص برای تشخیص کلمات کلیدی
  keywordDetected(keyword, action) {
    this.info(`🎯 Keyword detected: "${keyword}" -> ${action}`);
  }

  keywordProcessing(text, keywordsFound) {
    this.debug('🔍 Processing text for keywords', {
      text: text.substring(0, 100) + '...',
      keywordsFound
    });
  }

  // متدهای خاص برای AI
  aiRequest(userMessage, hasSystemData) {
    this.info('🤖 AI Request', {
      messageLength: userMessage.length,
      hasSystemData,
      preview: userMessage.substring(0, 50) + '...'
    });
  }

  aiResponse(responseLength, intent = null) {
    this.info('🤖 AI Response generated', {
      responseLength,
      intent
    });
  }

  // متدهای خاص برای TTS
  ttsRequest(textLength) {
    this.info('🔊 TTS Request', { textLength });
  }

  ttsSuccess(audioUrl) {
    this.info('🔊 TTS Success', { audioUrl: audioUrl ? 'Generated' : 'Failed' });
  }

  ttsError(error) {
    this.error('🔊 TTS Error', { error: error.message });
  }
}

// Factory function برای ایجاد logger برای ماژول‌های مختلف
function createLogger(module) {
  return new Logger(module);
}

module.exports = {
  Logger,
  createLogger,
  LOG_LEVELS
};