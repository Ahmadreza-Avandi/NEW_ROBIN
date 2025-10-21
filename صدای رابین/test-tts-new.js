const http = require('http');

console.log('Testing new TTS API...');

const data = JSON.stringify({
  text: 'سلام از نمونه',
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
  }
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response:', body);
    try {
      const json = JSON.parse(body);
      console.log('\nParsed Response:');
      console.log('Success:', json.success);
      console.log('Audio URL:', json.audioUrl);
      console.log('Direct URL:', json.directUrl);
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.error('Error code:', error.code);
});

req.write(data);
req.end();
