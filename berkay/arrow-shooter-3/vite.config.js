import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const reusablesDir = path.resolve(rootDir, '../../reusables');

/** Serve repo-level reusables/ at /reusables/ during dev and preview. */
function reusablesStaticPlugin() {
  return {
    name: 'reusables-static',
    configureServer(server) {
      server.middlewares.use('/reusables', serveReusables);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/reusables', serveReusables);
    },
    closeBundle() {
      const handSrc = path.join(reusablesDir, 'components', 'HandTutorial.js');
      const handDestDir = path.join(rootDir, 'dist', 'reusables', 'components');
      if (fs.existsSync(handSrc)) {
        fs.mkdirSync(handDestDir, { recursive: true });
        fs.copyFileSync(handSrc, path.join(handDestDir, 'HandTutorial.js'));
      }
    }
  };
}

function serveReusables(req, res, next) {
  const urlPath = (req.url || '').split('?')[0];
  const relative = urlPath.replace(/^\/reusables\/?/, '');
  const filePath = path.normalize(path.join(reusablesDir, relative));

  if (!filePath.startsWith(reusablesDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    next();
    return;
  }

  const ext = path.extname(filePath);
  const types = {
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.css': 'text/css'
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

export default defineConfig({
  root: '.',
  server: {
    open: true,
    fs: {
      allow: [rootDir, reusablesDir]
    }
  },
  preview: {
    fs: {
      allow: [rootDir, reusablesDir]
    }
  },
  plugins: [reusablesStaticPlugin()]
});
