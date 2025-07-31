import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Store from 'electron-store';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST, '../public')
  : path.join(process.env.DIST, './');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'FreePic Sketch',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  // カスタムプロトコルを登録
  protocol.registerFileProtocol('app-file', (request, callback) => {
    const url = request.url.replace('app-file://', '');
    try {
      return callback(decodeURI(path.normalize(url)));
    } catch (error) {
      console.error('Failed to register file protocol:', error);
      return callback(404);
    }
  });

  const store = new Store({
    schema: {
      histories: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            imageCount: { type: 'number' },
            intervalSec: { type: 'number' },
            restSec: { type: 'number' },
            createdAt: { type: 'string' },
            thumbnails: { type: 'array', items: { type: 'string' }, default: [] },
          },
          required: ['id', 'name', 'images', 'imageCount', 'intervalSec', 'restSec', 'createdAt'],
        },
      },
    },
  });

  ipcMain.handle('save-history', async (event, newHistory) => {
    const histories = store.get('histories', []);
    histories.unshift(newHistory);
    store.set('histories', histories);
  });

  ipcMain.handle('load-history', async () => {
    return store.get('histories', []);
  });

  ipcMain.handle('delete-history', async (event, historyId) => {
    const currentHistories = store.get('histories', []);
    const updatedHistories = currentHistories.filter((h) => h.id !== historyId);
    store.set('histories', updatedHistories);
  });

  ipcMain.handle('update-history-name', async (event, historyId, newName) => {
    const currentHistories = store.get('histories', []);
    const updatedHistories = currentHistories.map((h) =>
      h.id === historyId ? { ...h, name: newName } : h
    );
    store.set('histories', updatedHistories);
  });

  createWindow();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
