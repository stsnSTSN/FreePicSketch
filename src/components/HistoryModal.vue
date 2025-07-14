<template>
    <!-- 履歴一覧 -->
    <div class="modal-overlay" :class="{ 'is-active': isHistoriesVisible }" @click.self="emit('toggle-history')">
        <div class="modal-content">
            <div class="modal-header">
                <h3>セッション履歴</h3>
                <button class="close-button" @click="emit('toggle-history')" title="閉じる">&times;</button>
            </div>
            <div class="modal-body">
                <div class="nortification-submodal" :class="{ 'is-active': isSubmodalVisible }">
                    <p id="submordal-delete">セッションを削除しました</p>
                </div>
                <ul class="history-list">
                    <li v-if="!histories || histories.length === 0" class="no-history">
                        <p>まだセッション履歴がありません。レッツクロッキー！</p>
                    </li>
                    <li v-for="history in histories" :key="history.id" class="history-item"
                        :class="{ 'editing': editingHistoryId === history.id }">
                        <div class="info">
                            <div class="name" title="クリックして編集" @click="startEditing(history)">{{ history.name }}</div>
                            <!-- 編集モード用の入力欄 (編集中に表示) -->
                            <div class="edit-name">
                                <input type="text" v-model="editingName" @keyup.enter="saveEdit"
                                    @keyup.esc="cancelEdit" />
                                <div class="edit-actions">
                                    <button @click="saveEdit" class="btn-primary btn-sm">保存</button>
                                    <button @click="cancelEdit" class="btn-secondary btn-sm">キャンセル</button>
                                </div>
                            </div>
                            <div class="details">{{ history.imageCount }}枚 / {{ history.intervalSec }}秒 / 休憩{{
                                history.restSec }}秒</div>
                            <div class="timestamp">実施日時: {{ new Date(history.createdAt).toLocaleString() }}</div>
                            <div class="thumbs">
                                <img v-for="(thumb, index) in history.thumbnails.slice(0, 4)"
                                    :key="`${history.id}-${index}`" :src="`app-file://${thumb}`">
                            </div>
                        </div>
                        <div class="actions">
                            <button @click="emit('apply-history', [...history.images])"
                                class="btn-secondary">適用</button>
                            <button @click="handleDelete(history.id)" class="btn-danger">削除</button>
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
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { SessionHistory } from "../types/history";
defineProps<{
    isHistoriesVisible: boolean;
    histories: readonly SessionHistory[];
}>();

const emit = defineEmits<{
    (e: 'toggle-history'): void;
    (e: 'apply-history', value: string[]): void;
    (e: 'delete-history', value: string): void;
    (e: 'update-name', id: string, newName: string): void;
}>();

const isSubmodalVisible = ref(false);
const editingHistoryId = ref<string | null>(null);
const editingName = ref('');

const handleDelete = (historyId: string) => {
    emit('delete-history', historyId);
    // 削除時にサブモーダルを表示
    isSubmodalVisible.value = true;
    setTimeout(() => {
        isSubmodalVisible.value = false;
    }, 1000)
}

const startEditing = (history: SessionHistory) => {
    editingHistoryId.value = history.id;
    editingName.value = history.name;
}

const saveEdit = () => {
    if (editingHistoryId.value) {
        emit('update-name', editingHistoryId.value, editingName.value);
    }
    editingHistoryId.value = null;
}

const cancelEdit = () => {
    editingHistoryId.value = null;
}

</script>
<style scoped>
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
    z-index: 1001;
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

.no-history {
    text-align: center;
    color: #666;
    padding: 20px;
}

.nortification-submodal {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 50px;
    width: 80%;
    border: 1px solid #000;
    background: #FFF;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 800px;
    padding: 20px;
    border-radius: 8px;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    visibility: hidden;
    opacity: 0;
}

.nortification-submodal.is-active {
    transition: opacity 0.3s ease, visibility 0.3s ease;
    visibility: visible;
    opacity: 1;
}
</style>