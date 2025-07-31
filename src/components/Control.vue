<template>
    <div class="controls" :class="{ 'hidden-controls': !isControlsVisible }">
        <div class="controls-toggle" @click="emit('toggle-visibility')">
            <img class="controls-toggle-img" src="../assets/img/menu_toggle.png" alt="コントロールパネルの表示切り替え">
        </div>
        <input type="file" multiple accept="image/*" @change="onFileSelected" class="file-input"
            :disabled="isSessionActive" />
        <div class="input-group">
            <label for="interval-input">ランダム再生:</label>
            <button @click="emit('toggle-random')" class="toggle-random-button">
                <svg v-if="isRandom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="#2563eb"
                    id="svg_random_on">
                    <path
                        d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192s-86-192-192-192L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="#6b7280" id="svg_random_off">
                    <path
                        d="M384 128c70.7 0 128 57.3 128 128s-57.3 128-128 128l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z" />
                </svg>
            </button>
        </div>

        <div class="input-group">
            <label for="image-count-input">実施枚数:</label>
            <input type="number" id="image-count-input" class="time-input" :value="imageCount"
                @input="emit('update:imageCount', Number(($event.target as HTMLInputElement).value))" min="0"
                :disabled="isSessionActive" placeholder="全て">
            <span>枚</span>
            <label for="interval-input">表示秒数:</label>
            <div class="preset-input-wrapper" ref="intervalWrapper">
                <input type="number" id="interval-input" class="time-input" :value="intervalSec"
                    :disabled="isSessionActive"
                    @input="emit('update:intervalSec', Number(($event.target as HTMLInputElement).value))"
                    placeholder="秒" />
                <button @click="toggleMenu('interval')" class="preset-toggle-button" :disabled="isSessionActive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </button>
                <div v-show="isIntervalMenuOpen" class="preset-menu">
                    <ul>
                        <li v-for="preset in timeIntervalPresets" :key="preset">
                            <button @click="selectPreset('interval', preset)" class="preset-item-button">
                                {{ preset }}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <span>秒</span>
        </div>

        <div class="input-group">
            <label for="rest-input">休憩秒数:</label>
            <div class="preset-input-wrapper" ref="restWrapper">
                <input type="number" id="rest-input" class="time-input" :value="restSec" :disabled="isSessionActive"
                    @input="emit('update:restSec', Number(($event.target as HTMLInputElement).value))" placeholder="秒"
                    min="0" />
                <button @click="toggleMenu('rest')" class="preset-toggle-button" :disabled="isSessionActive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </button>
                <div v-show="isRestMenuOpen" class="preset-menu">
                    <ul>
                        <li v-for="preset in timeRestPresets" :key="preset">
                            <button @click="selectPreset('rest', preset)" class="preset-item-button">
                                {{ preset }}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            <span>秒</span>
        </div>

        <div class="button-group">
            <button @click="emit('toggle-play')" :class="{ 'start-button': !isPlaying, 'stop-button': isPlaying }">
                <img v-if="!isPlaying" src="../assets/img/play-solid.svg" alt="開始">
                <img v-else src="../assets/img/pause-solid.svg" alt="一時停止">
            </button>
            <button @click="emit('end-session')" class="end-session-button">
                セッション終了
            </button>
            <button class="btn-history" @click="emit('toggle-history')" :disabled="isSessionActive">履歴</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const timeIntervalPresets = [10, 30, 60, 90, 120, 180, 300];
const timeRestPresets = [5, 10, 20, 30];


defineProps<{
    isControlsVisible: boolean;
    intervalSec: number;
    restSec: number;
    isPlaying: boolean;
    isReady: boolean;
    isSessionFinished: boolean;
    isSessionActive: boolean;
    isRandom: boolean;
    imageCount: number;
}>();

const emit = defineEmits<{
    (e: 'update:intervalSec', value: number): void;
    (e: 'update:restSec', value: number): void;
    (e: 'toggle-play'): void;
    (e: 'end-session'): void;
    (e: 'files-selected', files: FileList | null): void;
    (e: 'toggle-visibility'): void;
    (e: 'toggle-history'): void;
    (e: 'toggle-random'): void;
    (e: 'update:imageCount', value: number): void;
}>();

const isIntervalMenuOpen = ref(false);
const isRestMenuOpen = ref(false);

const intervalWrapper = ref<HTMLElement | null>(null);
const restWrapper = ref<HTMLElement | null>(null);

// どちらの秒数メニューを開閉するかを判断
const toggleMenu = (type: 'interval' | 'rest') => {
    if (type === 'interval') {
        isIntervalMenuOpen.value = !isIntervalMenuOpen.value;
        isRestMenuOpen.value = false;
    } else {
        isRestMenuOpen.value = !isRestMenuOpen.value;
        isIntervalMenuOpen.value = false;
    }
};

// inputとselect、どちらの値を更新するかを判断してemit
const selectPreset = (type: 'interval' | 'rest', presetValue: number) => {
    if (type === 'interval') {
        emit('update:intervalSec', presetValue);
        isIntervalMenuOpen.value = false;
    } else {
        emit('update:restSec', presetValue);
        isRestMenuOpen.value = false;
    }
};

const onFileSelected = (event: Event) => {
    const input = event.target as HTMLInputElement;
    emit('files-selected', input.files);
}

// 秒数一覧メニューの外側をクリックしたら閉じる
const handleClickOutside = (event: MouseEvent) => {
    if (intervalWrapper.value && !intervalWrapper.value.contains(event.target as Node)) {
        isIntervalMenuOpen.value = false;
    }
    if (restWrapper.value && !restWrapper.value.contains(event.target as Node)) {
        isRestMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside, true);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside, true);
});

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

.file-input:disabled {
    cursor: not-allowed;
    background-color: #e9ecef;
    color: #6c757d;
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

.preset-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.time-input {
    width: 60px;
    padding: 8px 12px;
    border: 1px solid #c0d9eb;
    border-radius: 5px 0 0 5px;
    border-right: 0px;
    text-align: center;
    font-size: 1em;
    color: #2c3e50;
    -moz-appearance: textfield;
}

.time-input::-webkit-inner-spin-button,
.time-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.preset-toggle-button {
    padding: 8.5px;
    border: 1px solid #c0d9eb;
    border-left: none;
    border-radius: 0 5px 5px 0;
    background-color: #f8f9fa;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #495057;
}

.preset-toggle-button:hover {
    background-color: #e9ecef;
}

.time-input:disabled,
.preset-toggle-button:disabled {
    cursor: not-allowed;
    background-color: #e9ecef;
    color: #6c757d;
}

.preset-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    z-index: 20;
    margin-top: 4px;
    width: 100%;
    background: white;
    border: 1px solid #c0d9eb;
    border-radius: 5px;
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.05);
    max-height: 200px;
    overflow-y: auto;
}

.preset-menu ul {
    list-style: none;
    padding-left: unset;
}

.preset-item-button {
    width: 100%;
    text-align: left;
    padding: 8px 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1em;
}

.preset-item-button:hover {
    background-color: #e9f5ff;
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

.btn-history:disabled {
    cursor: not-allowed;
}

.toggle-random-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 35px;
    box-shadow: unset;
}

.toggle-random-button svg {
    width: 100%;
    height: 100%;
}
</style>