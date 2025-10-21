#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🧪 Testing all systems...\n');

// Test 1: TTS API
async function testTTS() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing TTS API...');
    
    const data = JSON.stringify({
      text: 'سلام',
      speaker: '3'
    });

    const options = {
      hostname: 'api.ahmadreza-avandi.ir',
      port: 80,
      path: '/text-to-speech',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.success && json.audioUrl) {
            console.log('   ✅ TTS API is working');
            console.log('   📁 Audio URL:', json.audioUrl.substring(0, 50) + '...');
          } else {
            console.log('   ❌ TTS API returned error:', json.error || 'Unknown error');
          }
        } catch (e) {
          console.log('   ❌ TTS API returned invalid JSON');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ TTS API connection failed:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ❌ TTS API timeout');
      req.destroy();
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Test 2: OpenRouter API
async function testOpenRouter() {
  return new Promise((resolve) => {
    console.log('\n2️⃣ Testing OpenRouter API...');
    
    const data = JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'user', content: 'سلام' }],
      max_tokens: 50
    });

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dastyar Robin',
        'Content-Length': data.length
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0] && json.choices[0].message) {
            console.log('   ✅ OpenRouter API is working');
            console.log('   💬 Response:', json.choices[0].message.content.substring(0, 50) + '...');
          } else if (json.error) {
            console.log('   ❌ OpenRouter API error:', json.error.message || json.error);
          } else {
            console.log('   ❌ OpenRouter API returned unexpected format');
          }
        } catch (e) {
          console.log('   ❌ OpenRouter API returned invalid JSON');
          console.log('   📄 Response:', body.substring(0, 200));
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ OpenRouter API connection failed:', error.message);
      console.log('   💡 Possible causes:');
      console.log('      - No internet connection');
      console.log('      - DNS resolution failed');
      console.log('      - Firewall blocking HTTPS');
      resolve();
    });

    req.on('timeout', () => {
      console.log('   ❌ OpenRouter API timeout');
      req.destroy();
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Test 3: DNS Resolution
async function testDNS() {
  return new Promise((resolve) => {
    console.log('\n3️⃣ Testing DNS resolution...');
    
    const dns = require('dns');
    
    dns.resolve4('openrouter.ai', (err, addresses) => {
      if (err) {
        console.log('   ❌ Cannot resolve openrouter.ai:', err.message);
      } else {
        console.log('   ✅ openrouter.ai resolves to:', addresses[0]);
      }
      
      dns.resolve4('api.ahmadreza-avandi.ir', (err2, addresses2) => {
        if (err2) {
          console.log('   ❌ Cannot resolve api.ahmadreza-avandi.ir:', err2.message);
        } else {
          console.log('   ✅ api.ahmadreza-avandi.ir resolves to:', addresses2[0]);
        }
        resolve();
      });
    });
  });
}

// Run all tests
async function runTests() {
  await testDNS();
  await testTTS();
  await testOpenRouter();
  
  console.log('\n✅ All tests completed!\n');
  console.log('📝 Summary:');
  console.log('   - If TTS works: Voice output should be functional');
  console.log('   - If OpenRouter works: AI responses should be functional');
  console.log('   - If both work: Full system should be operational');
  console.log('   - Database is optional and should not block the system\n');
}

runTests().catch(console.error);
