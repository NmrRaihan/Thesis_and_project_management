// Simple server to serve separated component files
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle routes
  let filePath = req.url;
  console.log(`Original URL: ${filePath}`);
  
  // Default route
  if (filePath === '/') {
    filePath = '/Home.html';
    console.log('Routing to Home.html');
  }
  
  // Student login route
  if (filePath === '/studentlogin') {
    filePath = '/StudentLogin.html';
    console.log('Routing to StudentLogin.html');
  }
  
  // Resolve the file path
  const basePath = path.join(process.cwd(), 'src/components/separated');
  filePath = path.join(basePath, filePath);
  
  console.log(`Looking for file: ${filePath}`);
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.log(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        console.log(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Student Login available at http://localhost:${PORT}/studentlogin`);
});