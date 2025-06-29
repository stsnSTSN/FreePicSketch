<script setup lang="ts">
import { ref, watch } from 'vue';
import Control from './components/Control.vue';
import { useSlideshow } from './composables/useSlideshow';

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
} = useSlideshow();

const isControlsVisible = ref(true);
const isHistoriesVisible = ref(false);

// controlsの表示切り替え（手動トグルボタン用）
const toggleControlsPanel = () => {
  isControlsVisible.value = !isControlsVisible.value;
}

const toggleHistorysPanel = () => {
  isHistoriesVisible.value = !isHistoriesVisible.value;
}

watch(isPlaying, (newIsPlaying) => {
  isControlsVisible.value = !newIsPlaying;
}, { immediate: true });



</script>

<template>
  <div class="croquis-app">
    <Control :is-controls-visible="isControlsVisible" v-model:interval-sec="intervalSec" v-model:rest-sec="restSec"
      :is-playing="isPlaying" :is-ready="isReady" :is-session-finished="isSessionFinished"
      @toggle-play="toggleSlideshow" @end-session="endSession" @toggle-history="toggleHistorysPanel"
      @files-selected="loadImages" @toggle-visibility="toggleControlsPanel"></Control>

    <!-- 画像表示エリア -->
    <div class="image-display-area">
      <!-- 履歴一覧 -->
      <div class="modal-overlay" :class="{ 'is-active': isHistoriesVisible }" @click="toggleHistorysPanel()">
        <div class="modal-content">
          <div class="modal-header">
            <h3>セッション履歴</h3>
            <button class="close-button" @click="toggleHistorysPanel()" title="閉じる">&times;</button>
          </div>
          <div class="modal-body">
            <ul class="history-list">
              <!-- 通常表示のアイテム -->
              <li class="history-item">
                <div class="info">
                  <div class="name" title="クリックして編集">人物クロッキーセット1</div>
                  <div class="details">15枚 / 60秒 / 休憩10秒</div>
                  <div class="timestamp">実施日時: 2024/05/17 14:20:35</div>
                  <div class="thumbs">
                    <!-- 最大４個表示 -->
                    <img src="./assets/img/thumb_prototype_01.jpg" alt="">
                    <img src="./assets/img/thumb_prototype_02.jpg" alt="">
                    <img src="./assets/img/thumb_prototype_03.jpg" alt="">
                  </div>
                </div>
                <div class="actions">
                  <button class="btn-secondary">適用</button>
                  <button class="btn-danger">削除</button>
                </div>
              </li>
              <!-- 名称を編集中 のアイテム -->
              <li class="history-item editing">
                <div class="info">
                  <!-- 表示モード用の名前 (編集中は非表示) -->
                  <div class="name" title="クリックして編集">風景スケッチ（短時間）</div>
                  <!-- 編集モード用の入力欄 (編集中に表示) -->
                  <div class="edit-name">
                    <input type="text" value="風景スケッチ（短時間）" />
                    <div class="edit-actions">
                      <button class="btn-primary btn-sm">保存</button>
                      <button class="btn-secondary btn-sm">キャンセル</button>
                    </div>
                  </div>
                  <div class="details">32枚 / 10秒 / 休憩0秒</div>
                  <div class="timestamp">実施日時: 2024/05/16 09:15:10</div>
                </div>
                <!-- 編集中は適用/削除ボタンを非表示にする -->
                <div class="actions"></div>
              </li>
              <li class="history-item">
                <div class="info">
                  <div class="name" title="クリックして編集">セッション 2024/05/15 21:45</div>
                  <div class="details">8枚 / 120秒 / 休憩30秒</div>
                  <div class="timestamp">実施日時: 2024/05/15 21:45:02</div>
                </div>
                <div class="actions">
                  <button class="btn-secondary">適用</button>
                  <button class="btn-danger">削除</button>
                </div>
              </li>
            </ul>
          </div>
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

/* 履歴一覧のスタイル */


.modal-content {
  position: absolute;
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  margin: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: absolute;
  max-width: 850px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.modal-header h3 {
  margin: 0;
}

.modal-header .close-button {
  font-size: 1.5rem;
  cursor: pointer;
  border: none;
  background: none;
}

.modal-body {
  padding: 20px 0;
}

.history-list {
  list-style: none;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 10px;
  background: #fff;
}

.history-item .info {
  flex-grow: 1;
}

.history-item .info .name {
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline dashed 1px #aaa;
  text-decoration-skip-ink: none;
  display: inline-block;
}

.history-item .info .name:hover {
  background-color: #f0f0f0;
}

.history-item .info .details {
  font-size: 0.9em;
  color: #666;
}

.history-item .info .timestamp {
  font-size: 0.8em;
  color: #888;
  margin-top: 4px;
}

.history-item.editing .info .name,
.history-item.editing .actions {
  display: none;
}

.edit-name {
  display: none;
}

.history-item.editing .edit-name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.history-item .thumbs img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.edit-name input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #007bff;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  gap: 5px;
}

.history-item .actions button {
  margin-left: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.9em;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding-top: 10px;
  text-align: right;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.is-active {
  visibility: visible;
  opacity: 1;
}

.modal-overlay.is-active .modal-content {
  transform: translateY(0);
}

/* 履歴一覧のスタイル end */
</style>