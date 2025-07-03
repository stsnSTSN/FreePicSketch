export interface SessionHistory {
  id: string;
  name: string; // セッション名
  imageCount: number; // 実施した枚数
  intervalSec: number; // 実施時間
  restSec: number; // 休憩時間
  thumbnails: string[]; // サムネイル画像のURL
  imagePaths: string[]; // 画像の元ファイルのパス
  createdAt: string; // 実施日時
}
