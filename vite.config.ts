/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist', // ビルド出力ディレクトリ
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // index.htmlをエントリーポイントとして指定
      },
    },
  },
  server: {
    host: 'localhost',
  },
  // Electronのmain.jsでViteの開発サーバーURLを参照できるようにするための設定
  define: {
    'process.env.VITE_DEV_SERVER_URL':
      process.env.NODE_ENV === 'development'
        ? JSON.stringify(`http://localhost:${process.env.VITE_PORT || 5173}`)
        : 'undefined',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
