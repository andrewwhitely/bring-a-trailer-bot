const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/preview.html') {
    fs.readFile(path.join(__dirname, 'preview.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading preview.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🎨 Preview server running at http://localhost:${PORT}`);
  console.log(`📱 Open your browser to see how the Discord embed will look!`);
});
