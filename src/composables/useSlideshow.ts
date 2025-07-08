import { ref, computed, watch } from 'vue';
import type { SessionHistory } from '../types/history';

export function useSlideshow() {
  // NOTE: blob URL(string)ではなく、Fileオブジェクトを直接保持するように変更
  // これにより、Electron環境でfile.pathプロパティにアクセスできる
  const images = ref<File[]>([]);
  const currentImageIndex = ref(0);

  const intervalSec = ref(60);
  const restSec = ref(10);
  const secondsLeft = ref(0);

  const isPlaying = ref(false);
  const isResting = ref(false);
  const isSessionFinished = ref(false);

  let timerId: number | null = null;

  const isReady = computed(() => images.value.length > 0);

  // NOTE: Fileオブジェクトから動的にblob URLを生成するよう変更
  const currentImage = computed(() => {
    if (!isReady.value || currentImageIndex.value >= images.value.length) {
      return null;
    }
    // 古いURLを解放し、新しいURLを生成
    const currentFile = images.value[currentImageIndex.value];
    return URL.createObjectURL(currentFile);
  });

  const loadImages = (files: FileList | null) => {
    if (!files) return;
    images.value = Array.from(files);
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
    isSessionFinished.value = true; // 状態の変更のみ行う
    console.log('useSlideshow.ts: Session ended. isSessionFinished set to true.');
  };

  watch(isPlaying, (playing) => {
    if (playing) {
      if (isSessionFinished.value) {
        currentImageIndex.value = 0;
      }
      isSessionFinished.value = false;
      startTimer(intervalSec.value, nextWithRest);
    } else {
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
  };
}
