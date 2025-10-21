const https = require('https');

console.log('Testing OpenRouter API connection...');

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Dastyar Robin'
  }
};

const data = JSON.stringify({
  model: 'anthropic/claude-3-haiku',
  messages: [
    { role: 'user', content: 'سلام' }
  ],
  max_tokens: 100
});

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
});

req.write(data);
req.end();
