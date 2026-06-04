<template>
  <div class="repair-log-timeline">
    <div v-loading="loading" class="timeline-wrapper">
      <div v-if="logs.length === 0" class="empty-state">
        <el-empty description="暂无修复日志" />
      </div>
      <div v-else class="timeline-list">
        <div
          v-for="(log, index) in logs"
          :key="log.id"
          class="timeline-item"
          :class="{ 'is-first': index === 0 }"
        >
          <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div v-if="index < logs.length - 1" class="marker-line"></div>
          </div>
          <div class="timeline-card retro-card">
            <div class="card-header">
              <div class="log-date">
                <el-icon class="date-icon"><Calendar /></el-icon>
                <span>{{ formatDate(log.log_date) }}</span>
              </div>
              <div class="log-actions">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleEdit(log)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDelete(log)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            <div class="card-content">
              <p class="log-content">{{ log.content }}</p>
            </div>
            <div v-if="log.photos && log.photos.length > 0" class="card-photos">
              <div class="photos-label">
                <el-icon><Picture /></el-icon>
                照片 ({{ log.photos.length }})
              </div>
              <div class="photos-grid">
                <div
                  v-for="(photo, photoIndex) in log.photos"
                  :key="photoIndex"
                  class="photo-item"
                  @click="previewPhoto(photo)"
                >
                  <img :src="photo" :alt="`修复照片 ${photoIndex + 1}`" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑日志"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="日期" prop="log_date">
          <el-date-picker
            v-model="editForm.log_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入修复日志内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="previewVisible"
      title="照片预览"
      width="80%"
      :close-on-click-modal="true"
    >
      <div class="photo-preview">
        <img :src="currentPreviewPhoto" alt="预览照片" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RepairLog } from '@/types'

const props = defineProps<{
  logs: RepairLog[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [log: RepairLog]
  delete: [id: number]
}>()

const editDialogVisible = ref(false)
const previewVisible = ref(false)
const currentPreviewPhoto = ref('')
const currentEditLog = ref<RepairLog | null>(null)

const editForm = reactive({
  log_date: '',
  content: ''
})

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

function handleEdit(log: RepairLog) {
  currentEditLog.value = log
  editForm.log_date = new Date(log.log_date).toISOString().split('T')[0]
  editForm.content = log.content
  editDialogVisible.value = true
}

function handleSaveEdit() {
  if (!editForm.content.trim()) {
    ElMessage.warning('请输入日志内容')
    return
  }
  if (currentEditLog.value) {
    emit('edit', {
      ...currentEditLog.value,
      log_date: editForm.log_date,
      content: editForm.content
    })
    editDialogVisible.value = false
  }
}

async function handleDelete(log: RepairLog) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条修复日志吗？此操作不可撤销。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    emit('delete', log.id)
  } catch {
  }
}

function previewPhoto(photo: string) {
  currentPreviewPhoto.value = photo
  previewVisible.value = true
}
</script>

<style scoped>
.repair-log-timeline {
  width: 100%;
}

.timeline-wrapper {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.timeline-list {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: 30px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item.is-first .marker-dot {
  background: var(--retro-gold);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3);
}

.timeline-marker {
  position: absolute;
  left: -30px;
  top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--retro-brown);
  border: 3px solid var(--retro-gold);
  flex-shrink: 0;
}

.marker-line {
  width: 2px;
  flex: 1;
  min-height: 50px;
  background: var(--retro-border);
  margin-top: 4px;
}

.timeline-card {
  padding: 20px;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  transform: translateX(5px);
  border-color: var(--retro-gold);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--retro-border);
}

.log-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--retro-gold);
  font-weight: bold;
  font-size: 1.05rem;
}

.date-icon {
  font-size: 1.2rem;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-content {
  color: var(--retro-text-primary);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-photos {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--retro-border);
}

.photos-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--retro-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.photos-label .el-icon {
  color: var(--retro-gold);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--retro-border);
  transition: all 0.3s ease;
}

.photo-item:hover {
  transform: scale(1.05);
  border-color: var(--retro-gold);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview {
  text-align: center;
}

.photo-preview img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .timeline-list {
    padding-left: 20px;
  }

  .timeline-marker {
    left: -20px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .log-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
