import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const rootDir = resolve(process.cwd());

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function resolveAssetPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0] || '/');
  const normalizedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = resolve(rootDir, `.${normalizedPath}`);

  if (!filePath.startsWith(rootDir + sep) && filePath !== rootDir) {
    throw new Error(`Blocked path: ${requestPath}`);
  }

  return filePath;
}

export async function startStaticServer() {
  return new Promise((resolveServer, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const filePath = resolveAssetPath(request.url || '/');
        const body = await readFile(filePath);
        response.statusCode = 200;
        response.setHeader(
          'content-type',
          contentTypes[extname(filePath)] || 'application/octet-stream',
        );
        response.end(body);
      } catch (error) {
        response.statusCode = 404;
        response.setHeader('content-type', 'text/plain; charset=utf-8');
        response.end('Not found');
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start static server.'));
        return;
      }

      resolveServer({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () =>
          new Promise((resolveClose) => {
            server.close(() => resolveClose());
          }),
      });
    });
  });
}
