const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = './apis.json';

app.use(express.static('public'));
app.use(express.json());

function loadAPIs() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveAPIs(apis) {
  fs.writeFileSync(FILE, JSON.stringify(apis, null, 2));
}

function pingAllAPIs() {
  const apis = loadAPIs();
  apis.forEach(url => {
    https.get(url, res => {
      console.log(`✅ Pinged ${url} - Status: ${res.statusCode}`);
    }).on('error', err => {
      console.error(`❌ Error: ${url}`, err.message);
    });
  });
}

app.get('/api/list', (req, res) => res.json(loadAPIs()));

app.post('/api/add', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send('URL required');
  const apis = loadAPIs();
  if (apis.includes(url)) return res.status(409).send('Already exists');
  apis.push(url);
  saveAPIs(apis);
  res.send('Added');
});

app.post('/api/delete', (req, res) => {
  const { url } = req.body;
  let apis = loadAPIs();
  if (!apis.includes(url)) return res.status(404).send('Not found');
  apis = apis.filter(a => a !== url);
  saveAPIs(apis);
  res.send('Deleted');
});

app.get('/api/ping', (req, res) => {
  pingAllAPIs();
  res.send('Pinged all APIs');
});

app.listen(PORT, () => {
  console.log(`🌐 Activator running at http://localhost:${PORT}`);
});
