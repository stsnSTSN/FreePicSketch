// electron/main.js
const { app, BrowserWindow } = require('electron')
const path = require('path')

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
      nodeIntegration: true, // ローカルファイルの読み込みなどElectron APIを使う場合
      contextIsolation: false, // Electron APIをWindowオブジェクトに公開する場合 (非推奨だが開発簡略化のため)
    },
  })

  // 開発モードか本番モードかで読み込むURLを切り替える
  // Vite開発サーバーからロードする場合
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools() // 開発中はDevToolsを開く
  } else {
    // Vueアプリのビルド結果 (dist/index.html) をロード
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// アプリケーションの準備が完了したらウィンドウを作成
app.whenReady().then(createWindow)

// 全てのウィンドウが閉じられたらアプリを終了
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // macOS以外ではアプリを終了
    app.quit()
  }
})

// macOSでドックアイコンをクリックしたときにウィンドウを再作成
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
