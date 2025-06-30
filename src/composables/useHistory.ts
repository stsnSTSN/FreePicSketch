import { ref, readonly } from 'vue';
import Store, { type Schema } from 'electron-store';

// --- 型定義 ---
// 履歴アイテムの型
export interface HistoryItem {
  id: string; // 一意のID (例: タイムスタンプやUUID)
  name: string; // セッション名
  images: string[]; // 画像データの配列 (DataURL)
  intervalSec: number;
  restSec: number;
  createdAt: string; // 作成日時のISO文字列
}

// electron-storeで保存するデータのスキーマ定義
interface StoreSchema {
  histories: HistoryItem[];
}

// --- electron-storeの初期化 ---

// スキーマとデフォルト値を定義
const schema: Schema<StoreSchema> = {
  histories: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        images: { type: 'array', items: { type: 'string' } },
        intervalSec: { type: 'number' },
        restSec: { type: 'number' },
        createdAt: { type: 'string' },
      },
      required: ['id', 'name', 'images', 'intervalSec', 'restSec', 'createdAt'],
    },
  },
};

// electron-storeのインスタンス化
// 明示的に型引数としてStoreSchemaを渡すことで、型推論を助けます
const store = new Store<StoreSchema>({ schema });

// --- コンポーザブル関数 ---

export function useHistory() {
  // --- 状態 ---
  // ストアから読み込んだ履歴データをリアクティブなrefとして保持
  // getメソッドにキーを渡し、型アサーションで明示的に型を伝える
  const histories = ref<HistoryItem[]>((store.get('histories') as HistoryItem[]) ?? []);

  // --- メソッド ---

  /**
   * 新しい履歴を保存する
   * @param sessionData 保存するセッションの情報
   */
  const saveHistory = (sessionData: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newHistory: HistoryItem = {
      ...sessionData,
      id: `session-${Date.now()}`, // 簡単な一意ID
      createdAt: new Date().toISOString(),
    };

    // getメソッドにキーを渡し、型アサーションで明示的に型を伝える
    const currentHistories = (store.get('histories') as HistoryItem[]) ?? [];
    const updatedHistories = [...currentHistories, newHistory];

    // setメソッドにキーと値を渡す
    store.set('histories', updatedHistories);
    histories.value = updatedHistories; // ローカルのrefも更新
  };

  /**
   * 指定したIDの履歴を削除する
   * @param historyId 削除する履歴のID
   */
  const deleteHistory = (historyId: string) => {
    // getメソッドにキーを渡し、型アサーションで明示的に型を伝える
    const currentHistories = (store.get('histories') as HistoryItem[]) ?? [];
    const updatedHistories = currentHistories.filter((h) => h.id !== historyId);

    // setメソッドにキーと値を渡す
    store.set('histories', updatedHistories);
    histories.value = updatedHistories; // ローカルのrefも更新
  };

  /**
   * 指定したIDの履歴の名前を更新する
   * @param historyId 更新する履歴のID
   * @param newName 新しい名前
   */
  const updateHistoryName = (historyId: string, newName: string) => {
    // getメソッドにキーを渡し、型アサーションで明示的に型を伝える
    const currentHistories = (store.get('histories') as HistoryItem[]) ?? [];
    const updatedHistories = currentHistories.map((h) =>
      h.id === historyId ? { ...h, name: newName } : h
    );

    // setメソッドにキーと値を渡す
    store.set('histories', updatedHistories);
    histories.value = updatedHistories; // ローカルのrefも更新
  };

  // コンポーネント側には読み取り専用の履歴データと操作関数を公開
  return {
    histories: readonly(histories),
    saveHistory,
    deleteHistory,
    updateHistoryName,
  };
}
