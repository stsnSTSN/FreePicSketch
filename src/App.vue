<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import type { SessionHistory } from './types/history';
import Control from './components/Control.vue';
import HistoryModal from './components/HistoryModal.vue';
import { useSlideshow } from './composables/useSlideshow';
import { useHistory } from './composables/useHistory';

const {
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
  loadImagesFromPaths
} = useSlideshow();

const { histories, saveHistory, loadHistories, deleteHistory, updateHistoryName } = useHistory(); // loadHistories を追加

const isControlsVisible = ref(true);
const isHistoriesVisible = ref(false);

const progressBarRef = ref<HTMLElement | null>(null);

// controlsの表示切り替え（手動トグルボタン用）
const toggleControlsPanel = () => {
  isControlsVisible.value = !isControlsVisible.value;
}

const toggleHistoriesPanel = () => {
  isHistoriesVisible.value = !isHistoriesVisible.value;
}

const applyHistory = (paths: string[]) => {
  loadImagesFromPaths(paths);
  isHistoriesVisible.value = false;
}

const progressBarColorClass = computed(() => {
  const percentageLeft = (secondsLeft.value / intervalSec.value) * 100;
  if (percentageLeft <= 10) {
    return 'progress-bar-red'
  }
  if (percentageLeft <= 25) {
    return 'progress-bar-yellow'
  }
  return 'progress-bar-green'
})

const restartProgressBarAnimation = () => {
  if (progressBarRef.value) {
    const bar = progressBarRef.value;
    // アニメーションをリセットして再開
    bar.classList.remove('is-animating');
    void bar.offsetWidth;
    bar.style.animationDuration = `${intervalSec.value}s`;
    bar.classList.add('is-animating');
  }
}

watch(isSessionFinished, async (finished) => {
  console.log('App.vue Watcher: isSessionFinished changed to:', finished);
  if (finished) {

    try {
      console.log('App.vue: Saving history with thumbnail paths.');
      // 履歴に保存する画像のパスを生成する
      const imagePaths = images.value.map(fileOrPath => {
        if (fileOrPath instanceof File) {
          // Electron環境でFileオブジェクトからフルパスを取得
          return (fileOrPath as any).path;
        }
        return fileOrPath;
      });

      const newHistoryData = {
        images: imagePaths, // 生成したパスの配列を保存
        imageCount: images.value.length,
        thumbnails: imagePaths,
        intervalSec: intervalSec.value,
        restSec: restSec.value,
      };
      await saveHistory(newHistoryData);
      console.log('App.vue: saveHistory call completed.');
    } catch (error) {
      console.error('App.vue: Error during history save:', error);
    }
  }
});

watch(isPlaying, async (playing) => {
  isControlsVisible.value = !playing;

  if (playing) {
    await nextTick(); //DOMの更新を待たないと、プログレスバーの要素を触れない
    restartProgressBarAnimation();
  }
}, { immediate: true });

watch(currentImageIndex, async () => {
  if (!isResting.value) {
    await nextTick();
    restartProgressBarAnimation();
  }
})

// アプリケーションがマウントされたときに履歴をロード
onMounted(() => {
  loadHistories();
});

</script>

<template>
  <div class="croquis-app">
    <Control :is-controls-visible="isControlsVisible" v-model:interval-sec="intervalSec" v-model:rest-sec="restSec"
      :is-playing="isPlaying" :is-ready="isReady" :is-session-finished="isSessionFinished"
      @toggle-play="toggleSlideshow" @end-session="endSession" @toggle-history="toggleHistoriesPanel"
      @files-selected="loadImages" @toggle-visibility="toggleControlsPanel()"></Control>

    <div class="image-display-area">
      <HistoryModal :is-histories-visible="isHistoriesVisible" :histories="histories"
        @toggle-history="toggleHistoriesPanel" @apply-history="applyHistory" @delete-history="deleteHistory"
        @update-name="updateHistoryName">
      </HistoryModal>
      <div class="progress-container" v-if="isPlaying || !isSessionFinished">
        <div class="progress-bar" ref="progressBarRef">
          <div class="progress-bar-fill" :class="progressBarColorClass"></div>
        </div>
      </div>

      <div v-if="isSessionFinished" class="placeholder">
        <p class="session-complete-message">セッション完了！</p>
      </div>
      <div v-else-if="isResting" class="placeholder rest-message">
        <p class="rest-message-text">休憩中</p>
        <p class="rest-timer-display">{{ secondsLeft }} 秒</p>
      </div>
      <div v-else-if="currentImage" class="image-container">
        <img :src="currentImage" alt="クロッキー画像" class="current-image" />
        <div class="overlay timer-overlay">{{ secondsLeft }} 秒</div>
        <div class="overlay index-overlay">{{ currentImageIndex + 1 }} / {{ images.length }}</div>
      </div>
      <div v-else class="placeholder">
        <p>画像をアップロードしてね！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.croquis-app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  min-height: 500px;
  height: 100%;
}

h1 {
  color: #34495e;
  margin-bottom: 30px;
  font-size: 2.2em;
}


.image-display-area {
  width: 100%;
  height: 100%;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.placeholder {
  color: #666;
  font-size: 1.5em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.placeholder p {
  margin: 0;
  padding: 0;
}

.session-complete-message {
  color: #007bff;
  font-size: 2em;
  font-weight: bold;
}

.rest-message {
  background-color: #ffccbc;
  color: #d32f2f;
  font-size: 1.8em;
  font-weight: bold;
}

.rest-message-text {
  font-size: 1.2em;
}

.rest-timer-display {
  font-size: 2.5em;
  font-weight: bold;
  margin-top: 10px;
  color: #d32f2f;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.current-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.overlay {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
}

.timer-overlay {
  top: 15px;
  right: 15px;
}

.index-overlay {
  top: 15px;
  left: 15px;
}

.progress-bar {
  height: 100%;
  position: absolute;
  top: 0;
  height: 10px;
}

.progress-bar-fill {
  width: 100%;
  height: 100%;
  transition: background-color 0.5s ease;
}

.progress-bar-green {
  background-color: #28a745;
}

.progress-bar-yellow {
  background-color: #ffc107;
}

.progress-bar-red {
  background-color: #dc3545;
}

@keyframes shrink-animation {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

.is-animating {
  animation-name: shrink-animation;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>