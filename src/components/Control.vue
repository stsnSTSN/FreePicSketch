<template>
    <!-- コントロールパネル -->
    <div class="controls" :class="{ 'hidden-controls': !isControlsVisible }">
        <div class="controls-toggle" @click="emit('toggle-visibility')">
            <img class="controls-toggle-img" src="../assets/img/menu_toggle.png" alt="コントロールパネルの表示切り替え">
        </div>
        <input type="file" multiple accept="image/*" @change="onFileSelected" class="file-input" />

        <div class="input-group">
            <label for="interval-input">表示秒数:</label>
            <input type="number" id="interval-input" :value="intervalSec"
                @input="emit('update:intervalSec', Number(($event.target as HTMLInputElement).value))" min="1"
                class="time-input" />
            <span>秒</span>
        </div>
        <div class="input-group">
            <label for="rest-input">休憩秒数:</label>
            <input type="number" id="rest-input" :value="restSec"
                @input="emit('update:restSec', Number(($event.target as HTMLInputElement).value))" min="0"
                class="time-input" />
            <span>秒</span>
        </div>
        <div class="button-group">
            <button @click="emit('toggle-play')" :disabled="!isReady"
                :class="{ 'start-button': !isPlaying, 'stop-button': isPlaying }">
                <img v-if="!isPlaying" src="../assets/img/play-solid.svg" alt="開始">
                <img v-else src="../assets/img/pause-solid.svg" alt="一時停止">
            </button>
            <button @click="emit('end-session')" :disabled="!isReady" class="end-session-button">
                セッション終了
            </button>
            <button class="btn-history" @click="emit('toggle-history')">履歴</button>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isControlsVisible: boolean;
    intervalSec: number;
    restSec: number;
    isPlaying: boolean;
    isReady: boolean;
    isSessionFinished: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:intervalSec', value: number): void;
    (e: 'update:restSec', value: number): void;
    (e: 'toggle-play'): void;
    (e: 'end-session'): void;
    (e: 'files-selected', files: FileList | null): void;
    (e: 'toggle-visibility'): void;
    (e: 'toggle-history'): void;
}>();

const onFileSelected = (event: Event) => {
    const input = event.target as HTMLInputElement;
    emit('files-selected', input.files);
}
</script>
<style scoped>
.controls {
    z-index: 10;
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    padding: 15px;
    background-color: #e9f5ff;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(0%);
    transition: transform 0.3s ease-out, opacity 0.3s ease-out, visibility 0s ease-out 0.3s;
    opacity: 1;
    visibility: visible;
}

.controls-toggle {
    width: 50px;
    height: 50px;
    position: absolute;
    top: -50px;
    right: 20px;
    background: #e9f5ff;
    padding: 5px;
    border-radius: 10px 10px 0px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1;
}

.controls-toggle-img {
    width: 35px;
    height: 35px;
}

.hidden-controls {
    transform: translateY(100%);
    opacity: 1;
    visibility: visible;
}


.file-input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #c0d9eb;
    border-radius: 5px;
    background-color: white;
    cursor: pointer;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    color: #34495e;
}

.button-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
}

.time-input {
    width: 60px;
    padding: 8px 12px;
    border: 1px solid #c0d9eb;
    border-radius: 5px;
    text-align: center;
    font-size: 1em;
    color: #2c3e50;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}

button img {
    width: 24px;
    height: 24px;
    vertical-align: middle;
    filter: invert(100%);
}


.start-button {
    background-color: #42b983;
    color: white;
}

.start-button:hover {
    background-color: #369c72;
    transform: translateY(-1px);
}

.start-button:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
    box-shadow: none;
}


.stop-button {
    background-color: #e74c3c;
    color: white;
}

.stop-button:hover {
    background-color: #c0392b;
    transform: translateY(-1px);
}

.end-session-button {
    background-color: #607d8b;
    color: white;
}

.end-session-button:hover {
    background-color: #455a64;
    transform: translateY(-1px);
}

.end-session-button:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
    box-shadow: none;
}
</style>