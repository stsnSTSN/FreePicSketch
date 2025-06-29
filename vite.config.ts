// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './', // ★Electronでファイルを読み込むために相対パスを指定
  build: {
    outDir: 'dist', // ビルド出力ディレクトリ
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
})
