const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// The target site
const TARGET_URL = 'https://lmarena.ai';

app.use(cors());

// Simple landing page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Proxy Access</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
          }
          a {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-size: 18px;
            font-weight: bold;
            transition: transform 0.3s;
          }
          a:hover {
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Proxy Portal</h1>
          <p>Click below to access the site</p>
          <a href="/proxy/">Enter Site</a>
        </div>
      </body>
    </html>
  `);
});

// Proxy endpoint with better headers
app.use('/proxy', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': '',
  },
  ws: true,
  followRedirects: true,
  onProxyReq: (proxyReq, req, res) => {
    // Remove headers that might identify this as a proxy
    proxyReq.removeHeader('x-forwarded-for');
    proxyReq.removeHeader('x-forwarded-proto');
    proxyReq.removeHeader('x-forwarded-host');
    
    // Set legitimate-looking headers
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
    proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
    proxyReq.setHeader('Cache-Control', 'no-cache');
    proxyReq.setHeader('Pragma', 'no-cache');
  },
  onProxyRes: (proxyRes, req, res) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    
    // Handle Cloudflare challenges
    if (proxyRes.statusCode === 403 || proxyRes.statusCode === 503) {
      proxyRes.headers['content-type'] = 'text/html';
    }
  },
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
