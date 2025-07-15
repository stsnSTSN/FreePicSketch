import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSlideshow } from './useSlideshow';
import { nextTick } from 'vue';

describe('useSlideshow', () => {
  // 各テストの前にタイマーモックを有効にする
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('初期状態では再生されておらず、残り時間は0であるべき', () => {
    const { isPlaying, secondsLeft } = useSlideshow();
    expect(isPlaying.value).toBe(false);
    expect(secondsLeft.value).toBe(0);
  });

  it('toggleSlideshowを呼ぶとisPlayingの状態が反転するべき', () => {
    const { isPlaying, toggleSlideshow } = useSlideshow();

    // 1回目の呼び出し
    toggleSlideshow();
    expect(isPlaying.value).toBe(true);

    // 2回目の呼び出し
    toggleSlideshow();
    expect(isPlaying.value).toBe(false);
  });

  it('タイマーを開始すると、1秒ごとにsecondsLeftが減少するべき', async () => {
    const { toggleSlideshow, secondsLeft, intervalSec } = useSlideshow();
    intervalSec.value = 5;

    toggleSlideshow();

    await nextTick();

    expect(secondsLeft.value).toBe(5);

    vi.advanceTimersByTime(1000);
    expect(secondsLeft.value).toBe(4);
  });
});
