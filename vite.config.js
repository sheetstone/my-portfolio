import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

// Converts screenshots to WebP during build and logs file-size savings.
// Drop any .png/.jpg into public/screenshots/ — the build handles the rest.
function screenshotOptimize({ quality = 82, maxWidth = 1440 } = {}) {
  return {
    name: 'screenshot-optimize',
    apply: 'build',
    async closeBundle() {
      let sharp;
      try {
        sharp = (await import('sharp')).default;
      } catch {
        console.warn('[img] sharp not found — skipping screenshot optimization');
        return;
      }

      const { readdir, stat, unlink } = await import('fs/promises');
      const { join } = await import('path');

      const dir = 'dist/screenshots';
      let files;
      try { files = await readdir(dir); } catch { return; } // no folder = no-op

      let totalSaved = 0;
      for (const file of files) {
        if (!/\.(png|jpe?g)$/i.test(file)) continue;

        const src  = join(dir, file);
        const dest = join(dir, file.replace(/\.(png|jpe?g)$/i, '.webp'));

        const before = (await stat(src)).size;
        await sharp(src)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .webp({ quality })
          .toFile(dest);
        const after = (await stat(dest)).size;
        await unlink(src); // remove the original from dist

        const pct = (((before - after) / before) * 100).toFixed(0);
        totalSaved += before - after;
        console.log(
          `  [img] ${file.padEnd(22)} ${(before / 1024).toFixed(0).padStart(6)} KB` +
          ` → ${(after / 1024).toFixed(0).padStart(5)} KB  (${pct}% smaller)`
        );
      }
      if (totalSaved > 0) {
        console.log(`  [img] total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    screenshotOptimize({ quality: 82, maxWidth: 1440 }),
    compression({ algorithm: 'gzip',          ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true, passes: 3 },
      mangle:   { toplevel: true, keep_classnames: false, keep_fnames: false },
      format:   { comments: false },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          three:  ['three'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
