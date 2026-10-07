import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return {
      root: 'demo',
      publicDir: '../demo/public',
    };
  }

  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'BadAppleEasterEgg',
        formats: ['es', 'umd', 'iife'],
        fileName: (format) => {
          if (format === 'es') return 'bad-apple-easter-egg.js';
          if (format === 'umd') return 'bad-apple-easter-egg.umd.cjs';
          if (format === 'iife') return 'bad-apple-easter-egg.iife.js';
          return `bad-apple-easter-egg.${format}.js`;
        },
      },
      rollupOptions: {
        output: {
          exports: 'named',
          assetFileNames: 'style.css',
        },
      },
    },
  };
});
