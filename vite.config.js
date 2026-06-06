import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // gzip — served by nginx/CDN as Content-Encoding: gzip
    compression({ algorithm: 'gzip', ext: '.gz' }),
    // brotli — preferred by modern browsers
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      mangle: {
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Split heavy deps into separate cacheable chunks
        manualChunks: {
          three: ['three'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
