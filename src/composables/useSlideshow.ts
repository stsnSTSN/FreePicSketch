import { ref, computed, watch, type Ref } from 'vue';

export function useSlideshow(isRandom: Ref<boolean>, imageCount: Ref<number>) {
  const allImages = ref<(File | string)[]>([]);
  const sessionImages = ref<(File | string)[]>([]);
  const currentImageIndex = ref(0);

  const intervalSec = ref(60);
  const restSec = ref(10);
  const secondsLeft = ref(0);

  const isPlaying = ref(false);
  const isResting = ref(false);
  const isSessionFinished = ref(false);

  let timerId: number | null = null;

  const isReady = computed(() => sessionImages.value.length > 0);

  const currentImage = computed(() => {
    if (!isReady.value || currentImageIndex.value >= sessionImages.value.length) {
      return null;
    }
    // 古いURLを解放し、新しいURLを生成
    const currentFile = sessionImages.value[currentImageIndex.value];
    if (currentFile instanceof File) {
      return URL.createObjectURL(currentFile);
    } else if (typeof currentFile === 'string') {
      return `app-file://${currentFile}`;
    }
  });

  const loadImages = (files: FileList | null) => {
    if (!files) return;
    allImages.value = Array.from(files);
    prepareSessionImages();
    currentImageIndex.value = 0;
    isSessionFinished.value = false;
  };

  const loadImagesFromPaths = (paths: string[] | null) => {
    if (!paths || paths.length === 0) return;
    allImages.value = paths;
    prepareSessionImages();
    currentImageIndex.value = 0;
    isSessionFinished.value = false;
  };

  const prepareSessionImages = () => {
    let imagesToUse = [...allImages.value];
    if (isRandom.value) {
      for (let i = imagesToUse.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [imagesToUse[i], imagesToUse[j]] = [imagesToUse[j], imagesToUse[i]];
      }
    }
    if (imageCount.value > 0 && imageCount.value < imagesToUse.length) {
      imagesToUse = imagesToUse.slice(0, imageCount.value);
    }
    sessionImages.value = imagesToUse;
  };

  const next = () => {
    if (currentImageIndex.value < sessionImages.value.length - 1) {
      currentImageIndex.value++;
      startTimer(intervalSec.value, nextWithRest);
    } else {
      endSession();
    }
  };

  const nextWithRest = () => {
    if (restSec.value > 0 && currentImageIndex.value < allImages.value.length - 1) {
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
      // セッションが完了済みか、初回スタートの時は、最初の画像からリスタート
      if (isSessionFinished.value || secondsLeft.value === 0) {
        prepareSessionImages();
        currentImageIndex.value = 0;
        isSessionFinished.value = false;
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
    allImages,
    images: sessionImages,
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
