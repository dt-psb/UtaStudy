import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

// Custom plugin to backup deleted songs to local 'trash/' directory
function trashBackupPlugin(): Plugin {
  return {
    name: 'trash-backup-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/trash' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const song = JSON.parse(body);
              const trashDir = path.resolve(process.cwd(), 'trash');
              if (!fs.existsSync(trashDir)) {
                fs.mkdirSync(trashDir, { recursive: true });
              }
              const safeId = (song.id || 'song').replace(/[^a-zA-Z0-9_-]/g, '_');
              const now = new Date().toISOString().replace(/[:.]/g, '-');
              const filename = `${safeId}_${now}.json`;
              const filePath = path.join(trashDir, filename);

              fs.writeFileSync(filePath, JSON.stringify(song, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ ok: true, savedTo: filename }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trashBackupPlugin()],
})
