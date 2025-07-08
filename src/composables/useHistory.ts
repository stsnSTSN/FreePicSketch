import { ref, readonly } from 'vue';
// HistoryItemの代わりにSessionHistoryをインポート
import type { SessionHistory } from '../types/history';

export function useHistory() {
  // 型をSessionHistoryに統一する
  const histories = ref<SessionHistory[]>([]);

  const saveHistory = async (sessionData: Omit<SessionHistory, 'id' | 'createdAt' | 'name'>) => {
    const newHistory: SessionHistory = {
      ...sessionData,
      id: `session-${Date.now()}`,
      name: `セッション ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      // readonlyプロパティに適合させるため、ここで配列をコピーする
      images: [...sessionData.images],
      thumbnails: [...sessionData.thumbnails],
    };

    if (window.electronAPI) {
      console.log('useHistory.ts: saveHistory function entered. Calling electronAPI.saveHistory');
      // newHistoryはSessionHistory型なので、そのまま渡せる
      await window.electronAPI.saveHistory(newHistory);
      await loadHistories();
      console.log('useHistory.ts: electronAPI.saveHistory completed.');
    } else {
      console.warn('useHistory.ts: electronAPI is not available. History will not be saved.');
    }
  };

  const loadHistories = async () => {
    if (window.electronAPI) {
      // 返り値も代入先もSessionHistory[]なので問題なく代入できる
      histories.value = await window.electronAPI.loadHistory();
    } else {
      console.warn('electronAPI is not available. Histories cannot be loaded.');
    }
  };

  const deleteHistory = async (historyId: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteHistory(historyId);
      await loadHistories();
    } else {
      console.warn('electronAPI is not available. History cannot be deleted.');
    }
  };

  const updateHistoryName = async (historyId: string, newName: string) => {
    if (window.electronAPI) {
      await window.electronAPI.updateHistoryName(historyId, newName);
      await loadHistories();
    } else {
      console.warn('electronAPI is not available. History name cannot be updated.');
    }
  };

  return {
    histories: readonly(histories),
    saveHistory,
    loadHistories,
    deleteHistory,
    updateHistoryName,
  };
}
