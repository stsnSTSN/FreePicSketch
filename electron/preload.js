const { contextBridge, ipcRenderer } = require('electron');
// レンダラープロセス(useSlideshow.ts)は、Node.jsのAPIにアクセスできない(≒PC内のファイルへアクセス出来ない)。
// そこで、メインプロセス(main.js)と安全に通信するための関数をwindowオブジェクトに公開する。
contextBridge.exposeInMainWorld('electronAPI', {
  saveHistory: (history) => ipcRenderer.invoke('save-history', history),
  loadHistory: () => ipcRenderer.invoke('load-history'),
  deleteHistory: (historyId) => ipcRenderer.invoke('delete-history', historyId),
  updateHistoryName: (historyId, newName) =>
    ipcRenderer.invoke('update-history-name', historyId, newName),
});
