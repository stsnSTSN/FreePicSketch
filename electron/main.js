import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST, '../public')
  : path.join(process.env.DIST, './');

function createWindow() {
  // メインウィンドウを作成
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      // Vueアプリのビルド結果をレンダラープロセスでロード
      // contextIsolation: true, // セキュリティ強化のため推奨されるが、Vueとの連携で調整が必要な場合がある
      // sandbox: true // セキュリティ強化のため推奨されるが、Vueとの連携で調整が必要な場合がある
      // 開発中のみDevToolsを開く
      contextIsolation: false, // Electron APIをWindowオブジェクトに公開する場合 (非推奨だが開発簡略化のため)
    },
  });

  // 開発モードか本番モードかで読み込むURLを切り替える
  // Vite開発サーバーからロードする場合
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools(); // 開発中はDevToolsを開く
  } else {
    // Vueアプリのビルド結果 (dist/index.html) をロード
    win.loadFile(path.join(process.env.DIST, '../dist/index.html'));
  }
}

// アプリケーションの準備が完了したらウィンドウを作成
app.whenReady().then(createWindow);

// 全てのウィンドウが閉じられたらアプリを終了
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // macOS以外ではアプリを終了
    app.quit();
  }
});

// macOSでドックアイコンをクリックしたときにウィンドウを再作成
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// electron-store のインスタンスを作成
const store = new Store({
  // スキーマを定義しておくと、データの整合性が保たれて安全です
  schema: {
    histories: {
      type: 'array',
      default: [],
    },
  },
});

// 履歴を保存するIPCハンドラ
ipcMain.handle('save-history', async (event, newHistory) => {
  const histories = store.get('histories', []);
  histories.unshift(newHistory); // 新しい履歴を配列の先頭に追加
  store.set('histories', histories);
});

// 履歴を読み込むIPCハンドラ
ipcMain.handle('load-history', async () => {
  return store.get('histories', []);
});
