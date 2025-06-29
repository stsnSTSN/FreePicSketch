import { ref, computed, onUnmounted, watch } from 'vue';

export function useSlideshow() {
  // --- 状態 ---
  const images = ref<string[]>([]);
  const currentImageIndex = ref(0);
  const intervalSec = ref(5);
  const restSec = ref(0);
  const secondsLeft = ref(0);
  const isPlaying = ref(false);
  const isResting = ref(false);
  const isSessionFinished = ref(false);
  const timerId = ref<number | null>(null);

  // --- 算出プロパティ ---
  const currentImage = computed(() => {
    if (isResting.value || !images.value[currentImageIndex.value]) {
      return null;
    }
    return images.value[currentImageIndex.value];
  });

  const isReady = computed(() => images.value.length > 0 && !isSessionFinished.value);

  // --- メソッド ---

  const reset = () => {
    if (timerId.value) clearInterval(timerId.value);
    timerId.value = null;
    images.value = [];
    currentImageIndex.value = 0;
    isPlaying.value = false;
    isResting.value = false;
    isSessionFinished.value = false;
    secondsLeft.value = 0;
  };

  /**
   * 画像ファイルを読み込み、データURLとして状態を更新する
   * @param files ファイル入力からのFileListオブジェクト
   */
  const loadImages = (files: FileList | null) => {
    reset(); // 新しい画像を読み込む際は、常に状態をリセットする
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result
            ? resolve(e.target.result as string)
            : reject(new Error('File read error'));
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then((results) => {
        images.value = results;
        secondsLeft.value = intervalSec.value; // 最初の画像のタイマーを準備
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        alert('画像の読み込みに失敗しました。');
        reset(); // エラー発生後、状態をクリーンにする
      });
  };

  const tick = () => {
    secondsLeft.value--;
    if (secondsLeft.value > 0) return;

    if (isResting.value) {
      isResting.value = false;
      currentImageIndex.value++;
      if (currentImageIndex.value >= images.value.length) {
        endSession();
        return;
      }
      secondsLeft.value = intervalSec.value;
    } else {
      if (restSec.value > 0 && currentImageIndex.value < images.value.length - 1) {
        isResting.value = true;
        secondsLeft.value = restSec.value;
      } else {
        currentImageIndex.value++;
        if (currentImageIndex.value >= images.value.length) {
          endSession();
          return;
        }
        secondsLeft.value = intervalSec.value;
      }
    }
  };

  const pauseSlideshow = () => {
    isPlaying.value = false;
    if (timerId.value) clearInterval(timerId.value);
    timerId.value = null;
  };

  const startSlideshow = () => {
    if (!isReady.value) return;
    isPlaying.value = true;
    if (secondsLeft.value === 0) secondsLeft.value = intervalSec.value;
    if (timerId.value) clearInterval(timerId.value);
    timerId.value = window.setInterval(tick, 1000);
  };

  const toggleSlideshow = () => {
    isPlaying.value ? pauseSlideshow() : startSlideshow();
  };

  const endSession = () => {
    pauseSlideshow();
    isSessionFinished.value = true;
  };

  watch([intervalSec, restSec], () => {
    if (isPlaying.value) {
      pauseSlideshow();
      startSlideshow();
    }
  });

  onUnmounted(() => {
    if (timerId.value) clearInterval(timerId.value);
  });

  return {
    images,
    currentImageIndex,
    intervalSec,
    restSec,
    secondsLeft,
    isPlaying,
    isResting,
    isSessionFinished,
    currentImage,
    isReady,
    loadImages,
    toggleSlideshow,
    endSession,
  };
}
