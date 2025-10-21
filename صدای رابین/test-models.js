#!/usr/bin/env node

const https = require('https');

const API_KEY = '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';

const models = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free'
];

async function testModel(model) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing model: ${model}`);
    
    const data = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'تو رابین هستی، دستیار هوشمند. به زبان فارسی پاسخ بده.' },
        { role: 'user', content: 'سلام، خودتو معرفی کن' }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dastyar Robin',
        'Content-Length': data.length
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0] && json.choices[0].message) {
            const content = json.choices[0].message.content;
            console.log('✅ Response received');
            console.log('📝 Content preview:', content.substring(0, 150));
            
            // بررسی تگ‌های فکری
            const hasThinkTags = /<think>|<thinking>/i.test(content);
            const hasEnglishThinking = /\b(okay|let me|check|need to|should|according to)\b/i.test(content);
            
            if (hasThinkTags) {
              console.log('⚠️  Contains <think> tags');
            }
            if (hasEnglishThinking) {
              console.log('⚠️  Contains English thinking text');
            }
            if (!hasThinkTags && !hasEnglishThinking) {
              console.log('✨ Clean response - RECOMMENDED');
            }
            
          } else if (json.error) {
            console.log('❌ Error:', json.error.message || json.error);
          } else {
            console.log('❌ Unexpected response format');
          }
        } catch (e) {
          console.log('❌ Failed to parse JSON');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🎯 Testing different AI models for Persian responses...\n');
  console.log('Looking for models that:');
  console.log('  ✓ Respond in Persian');
  console.log('  ✓ No <think> tags');
  console.log('  ✓ No English thinking text');
  console.log('  ✓ Direct, clean responses\n');
  console.log('='.repeat(60));
  
  for (const model of models) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between requests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Testing complete!');
  console.log('\n💡 Recommendation: Use models marked as "RECOMMENDED"');
  console.log('   These provide clean Persian responses without thinking tags.\n');
}

runTests().catch(console.error);
