import type { SessionHistory } from './types/history';

// グローバルなWindowインターフェースを拡張する
declare global {
  interface Window {
    electronAPI: {
      saveHistory: (history: SessionHistory) => Promise<void>;
      loadHistory: () => Promise<SessionHistory[]>;
      saveThumbnail: (base64Data: string) => Promise<string | null>;
      deleteHistory: (historyId: string) => Promise<void>;
      updateHistoryName: (historyId: string, newName: string) => Promise<void>;
    };
  }
}

export {};
