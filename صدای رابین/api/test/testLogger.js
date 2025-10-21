const { createLogger } = require('../utils/logger');

// تست سیستم لاگ‌گیری
function testLogger() {
  console.log('🧪 Testing Logger System...\n');

  const logger = createLogger('TEST');

  // تست سطوح مختلف لاگ
  logger.error('This is an error message', { code: 500, details: 'Something went wrong' });
  logger.warn('This is a warning message', { warning: 'Deprecated function used' });
  logger.info('This is an info message', { status: 'Processing completed' });
  logger.debug('This is a debug message', { variables: { x: 1, y: 2 } });

  // تست متدهای خاص
  logger.dbQuery('SELECT * FROM users WHERE id = ?', [123]);
  logger.dbResult(5, 150);
  logger.dbError(new Error('Connection timeout'), 'SELECT * FROM customers');

  logger.keywordDetected('مشتریان', 'getCustomers');
  logger.aiRequest('سلام، لیست مشتریان رو بده', true);
  logger.aiResponse(250, 'getCustomers');

  logger.ttsRequest(100);
  logger.ttsSuccess('/api/audio/123.mp3');

  console.log('\n✅ Logger test completed!');
}

if (require.main === module) {
  testLogger();
}

module.exports = { testLogger };