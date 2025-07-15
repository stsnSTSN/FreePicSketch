import { ref, computed, watch } from 'vue';

export function useSlideshow() {
  const images = ref<(File | string)[]>([]);
  const currentImageIndex = ref(0);

  const intervalSec = ref(60);
  const restSec = ref(10);
  const secondsLeft = ref(0);

  const isPlaying = ref(false);
  const isResting = ref(false);
  const isSessionFinished = ref(false);

  let timerId: number | null = null;

  const isReady = computed(() => images.value.length > 0);

  const currentImage = computed(() => {
    if (!isReady.value || currentImageIndex.value >= images.value.length) {
      return null;
    }
    // 古いURLを解放し、新しいURLを生成
    const currentFile = images.value[currentImageIndex.value];
    if (currentFile instanceof File) {
      return URL.createObjectURL(currentFile);
    } else if (typeof currentFile === 'string') {
      return `app-file://${currentFile}`;
    }
  });

  const loadImages = (files: FileList | null) => {
    if (!files) return;
    images.value = Array.from(files);
    currentImageIndex.value = 0;
    isSessionFinished.value = false;
  };

  const loadImagesFromPaths = (paths: string[] | null) => {
    if (!paths || paths.length === 0) return;
    images.value = paths;
    currentImageIndex.value = 0;
    isSessionFinished.value = false;
  };

  const next = () => {
    if (currentImageIndex.value < images.value.length - 1) {
      currentImageIndex.value++;
      startTimer(intervalSec.value, nextWithRest);
    } else {
      endSession();
    }
  };

  const nextWithRest = () => {
    if (restSec.value > 0 && currentImageIndex.value < images.value.length - 1) {
      isResting.value = true;
      startTimer(restSec.value, () => {
        isResting.value = false;
        next();
      });
    } else {
      next();
    }
  };

  const startTimer = (duration: number, onComplete: () => void) => {
    if (timerId) clearInterval(timerId);
    secondsLeft.value = duration;
    timerId = window.setInterval(() => {
      secondsLeft.value--;
      if (secondsLeft.value <= 0) {
        if (timerId) clearInterval(timerId);
        onComplete();
      }
    }, 1000);
  };

  const toggleSlideshow = () => {
    isPlaying.value = !isPlaying.value;
  };

  const endSession = async () => {
    if (timerId) clearInterval(timerId);
    isPlaying.value = false;
    isSessionFinished.value = true;
  };

  watch(isPlaying, (playing) => {
    if (playing) {
      // もしセッションが完了済みなら、最初の画像からリスタート
      if (isSessionFinished.value) {
        currentImageIndex.value = 0;
        isSessionFinished.value = false;
        startTimer(intervalSec.value, nextWithRest);
        return;
      }

      // 休憩中なら残り秒数、初回スタート時なら指定の表示秒数
      const duration = secondsLeft.value > 0 ? secondsLeft.value : intervalSec.value;

      const onCompleteCallback = isResting.value
        ? () => {
            // 休憩タイマーが完了した場合
            isResting.value = false;
            next();
          }
        : nextWithRest; // 画像表示タイマーが完了した場合

      startTimer(duration, onCompleteCallback);
    } else {
      // 一時停止時の処理
      if (timerId) clearInterval(timerId);
    }
  });

  return {
    images,
    currentImageIndex,
    currentImage,
    intervalSec,
    restSec,
    secondsLeft,
    isPlaying,
    isResting,
    isSessionFinished,
    isReady,
    loadImages,
    toggleSlideshow,
    endSession,
    loadImagesFromPaths,
  };
}
