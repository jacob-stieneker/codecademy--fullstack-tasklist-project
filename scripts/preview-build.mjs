// A local-only server for testing the compiled app, including Angular's deep links.
// This is a test utility. Firebase Hosting remains the documented cloud destination.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist/shipyard/browser');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    // Psudo code //
    // Serve compiled assets from the build directory.
    // For a page route, serve index.html so Angular can render the correct page.
    const extension = extname(file);
    const body = await readFile(extension ? file : resolve(root, 'index.html'));
    response.writeHead(200, { 'Content-Type': types[extension || '.html'] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(4300, '127.0.0.1', () => console.log('Built Shipyard preview: http://127.0.0.1:4300'));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
