import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-AMC-Vendor-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy route
app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    const response = await fetch(url, { headers: { 'X-AMC-Vendor-Key': req.headers['x-amc-vendor-key'] } });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
