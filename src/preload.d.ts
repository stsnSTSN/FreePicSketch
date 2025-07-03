import type { SessionHistory } from './types/history';

// グローバルなWindowインターフェースを拡張する
declare global {
  interface Window {
    electronAPI: {
      saveHistory: (history: SessionHistory) => Promise<void>;
      loadHistory: () => Promise<SessionHistory[]>;
    };
  }
}

export {};
