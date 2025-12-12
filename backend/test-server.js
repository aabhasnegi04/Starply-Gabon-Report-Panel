// Simple test server to verify Node.js is working
const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    message: 'Node.js is working!',
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'not set'
  }));
});

server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
