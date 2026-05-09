import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  root: __dirname,
  publicDir: 'public',
  server: {
    fs: {
      allow: [__dirname, repoRoot],
    },
  },
  resolve: {
    alias: {
      reusables: path.join(repoRoot, 'reusables'),
    },
  },
});
