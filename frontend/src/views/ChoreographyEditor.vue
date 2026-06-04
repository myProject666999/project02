<template>
  <div class="choreography-editor" v-loading="loading">
    <div class="page-header">
      <h2>{{ choreography.name || '编排编辑' }}</h2>
      <div>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          <el-icon><Check /></el-icon> 保存
        </el-button>
      </div>
    </div>

    <el-row :gutter="16" class="editor-body">
      <el-col :span="8">
        <div class="panel left-panel">
          <div class="panel-header">
            <span>动作素材</span>
          </div>
          <div class="filter-bar compact">
            <el-input v-model="actionSearch" placeholder="搜索动作" clearable size="small" @input="searchActions">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="styleFilter" placeholder="风格" clearable size="small" @change="searchActions">
              <el-option label="街舞" value="street" />
              <el-option label="民族" value="folk" />
              <el-option label="现代" value="modern" />
              <el-option label="Jazz" value="jazz" />
            </el-select>
          </div>
          <div class="action-pool">
            <draggable
              :list="availableActions"
              :group="{ name: 'actions', pull: 'clone', put: false }"
              :clone="cloneAction"
              item-key="id"
              class="action-pool-list"
            >
              <template #item="{ element }">
                <div class="pool-card">
                  <div class="pool-card-icon">
                    <el-icon><VideoPlay /></el-icon>
                  </div>
                  <div class="pool-card-info">
                    <div class="pool-card-name">{{ element.name }}</div>
                    <div class="pool-card-tags">
                      <el-tag size="small" type="primary">{{ styleMap[element.style] || element.style }}</el-tag>
                      <el-tag size="small" type="success">{{ element.beat }}拍</el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
            <el-empty v-if="availableActions.length === 0" description="暂无素材" :image-size="60" />
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="panel right-panel">
          <div class="panel-header">
            <span>节拍时间轴</span>
            <span class="panel-subtitle">总拍数：{{ choreography.totalBeats }}拍</span>
          </div>
          <div class="timeline-container">
            <div class="beat-timeline">
              <div
                v-for="(beatSlot, index) in beatSlots"
                :key="index"
                class="beat-slot"
                :class="{ filled: beatSlot.action }"
              >
                <div class="beat-label">第{{ index + 1 }}个8拍</div>
                <template v-if="beatSlot.action">
                  <div class="beat-action-name">{{ beatSlot.action.name }}</div>
                  <el-icon class="beat-remove" @click="removeItem(beatSlot)"><Close /></el-icon>
                </template>
                <template v-else>
                  <div class="beat-empty">拖入动作</div>
                </template>
              </div>
            </div>
            <draggable
              v-model="timelineItems"
              group="actions"
              item-key="itemId"
              class="timeline-draggable"
              @end="onDragEnd"
            >
              <template #item="{ element, index }">
                <div class="timeline-item">
                  <span class="timeline-item-index">{{ index + 1 }}</span>
                  <span class="timeline-item-name">{{ element.name }}</span>
                  <el-icon class="timeline-item-remove" @click="removeTimelineItem(index)"><Close /></el-icon>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="editor-footer">
      <el-button type="primary" size="large" @click="startPreview" :disabled="timelineItems.length === 0">
        <el-icon><VideoPlay /></el-icon> 预览播放
      </el-button>
    </div>

    <el-dialog v-model="previewVisible" title="编排预览" width="800px" destroy-on-close @close="stopPreview">
      <div class="video-player-container">
        <video ref="previewVideoRef" :src="currentPreviewVideo" controls @ended="onVideoEnded" />
      </div>
      <div class="preview-info">
        <span>正在播放：{{ currentPreviewName }}</span>
        <span>（{{ previewIndex + 1 }} / {{ timelineItems.length }}）</span>
      </div>
      <div class="preview-timeline">
        <div
          v-for="(item, idx) in timelineItems"
          :key="idx"
          class="preview-timeline-item"
          :class="{ active: idx === previewIndex }"
          @click="jumpToPreview(idx)"
        >
          {{ item.name }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { getChoreography, updateChoreography, addItem, removeItem as removeItemApi, reorderItems } from '@/api/choreography'
import { getActions } from '@/api/action'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const choreographyId = route.params.id

const loading = ref(false)
const saving = ref(false)
const choreography = ref({})
const timelineItems = ref([])
const availableActions = ref([])
const actionSearch = ref('')
const styleFilter = ref('')
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewVideoRef = ref(null)

const styleMap = { street: '街舞', folk: '民族', modern: '现代', jazz: 'Jazz' }

function getVideoUrl(path) {
  if (!path) return ''
  const filename = path.replace('static/videos/', '')
  return `/videos/${filename}`
}

const beatSlotCount = computed(() => Math.ceil((choreography.value.totalBeats || 32) / 8))

const beatSlots = computed(() => {
  const slots = []
  for (let i = 0; i < beatSlotCount.value; i++) {
    const matchedItem = timelineItems.value.find(item => item.beatPosition === i + 1)
    slots.push({
      index: i,
      beatPosition: i + 1,
      action: matchedItem || null
    })
  }
  return slots
})

const currentPreviewVideo = computed(() => {
  if (timelineItems.value.length === 0) return ''
  const item = timelineItems.value[previewIndex.value]
  return getVideoUrl(item?.videoPath || item?.videoUrl || '')
})

const currentPreviewName = computed(() => {
  if (timelineItems.value.length === 0) return ''
  return timelineItems.value[previewIndex.value]?.name || ''
})

let itemIdCounter = 0

function cloneAction(action) {
  return {
    ...action,
    itemId: `new_${Date.now()}_${itemIdCounter++}`,
    beatPosition: null
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await getChoreography(choreographyId)
    choreography.value = res
    timelineItems.value = (res.items || []).map((item, idx) => ({
      ...item,
      itemId: item.id || `existing_${idx}`,
      name: item.actionName || item.name || '',
      videoPath: item.videoPath || item.actionVideoPath || ''
    }))
    searchActions()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function searchActions() {
  try {
    const params = { page: 1, pageSize: 100 }
    if (actionSearch.value) params.name = actionSearch.value
    if (styleFilter.value) params.style = styleFilter.value
    const res = await getActions(params)
    availableActions.value = Array.isArray(res) ? res : res.records || res.list || []
  } catch (e) {
    console.error(e)
  }
}

async function removeItem(beatSlot) {
  if (!beatSlot.action) return
  const item = timelineItems.value.find(i => i.itemId === beatSlot.action.itemId)
  if (!item) return
  const idx = timelineItems.value.indexOf(item)
  await removeTimelineItem(idx)
}

async function removeTimelineItem(index) {
  const item = timelineItems.value[index]
  if (!item) return
  try {
    if (item.id && !String(item.itemId).startsWith('new_')) {
      await removeItemApi(choreographyId, item.id)
    }
    timelineItems.value.splice(index, 1)
  } catch (e) {
    console.error(e)
  }
}

async function onDragEnd() {
  const items = timelineItems.value.map((item, index) => ({
    actionId: item.actionId || item.id,
    beatPosition: index + 1,
    orderIndex: index
  }))
  try {
    await reorderItems(choreographyId, items)
  } catch (e) {
    console.error(e)
  }
}

async function handleSave() {
  saving.value = true
  try {
    for (const item of timelineItems.value) {
      if (String(item.itemId).startsWith('new_')) {
        await addItem(choreographyId, {
          actionId: item.id,
          beatPosition: timelineItems.value.indexOf(item) + 1,
          orderIndex: timelineItems.value.indexOf(item)
        })
      }
    }
    await updateChoreography(choreographyId, {
      name: choreography.value.name,
      totalBeats: choreography.value.totalBeats,
      description: choreography.value.description
    })
    ElMessage.success('保存成功')
    loadData()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function startPreview() {
  if (timelineItems.value.length === 0) return
  previewIndex.value = 0
  previewVisible.value = true
}

function stopPreview() {
  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
  }
}

function onVideoEnded() {
  if (previewIndex.value < timelineItems.value.length - 1) {
    previewIndex.value++
  } else {
    ElMessage.info('预览播放完毕')
  }
}

function jumpToPreview(index) {
  previewIndex.value = index
}

function goBack() {
  router.push('/choreography')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.choreography-editor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
}

.editor-body {
  flex: 1;
  min-height: 0;
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
}

.panel-header {
  padding: 14px 18px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .panel-subtitle {
    font-size: 13px;
    font-weight: 400;
    color: #6e6e8a;
  }
}

.left-panel {
  .filter-bar.compact {
    margin: 12px 12px 0;
    padding: 10px;
    gap: 8px;

    .el-input, .el-select {
      width: 120px;
    }
  }

  .action-pool {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
  }

  .action-pool-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pool-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    cursor: grab;
    transition: all 0.2s;

    &:hover {
      border-color: #7c4dff;
      background: rgba(124, 77, 255, 0.04);
    }

    &:active {
      cursor: grabbing;
    }

    .pool-card-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, #7c4dff, #e040fb);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      flex-shrink: 0;
    }

    .pool-card-info {
      flex: 1;
      min-width: 0;

      .pool-card-name {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pool-card-tags {
        margin-top: 4px;
        display: flex;
        gap: 4px;
      }
    }
  }
}

.right-panel {
  .timeline-container {
    flex: 1;
    overflow-x: auto;
    padding: 16px;
  }

  .timeline-draggable {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #7c4dff22, #e040fb11);
    border: 1px solid #7c4dff44;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s;

    &:hover {
      border-color: #7c4dff;
      box-shadow: 0 2px 8px rgba(124, 77, 255, 0.2);
    }

    .timeline-item-index {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c4dff, #e040fb);
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .timeline-item-name {
      font-size: 13px;
      font-weight: 600;
      color: #2d2d3a;
    }

    .timeline-item-remove {
      color: #f56c6c;
      cursor: pointer;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .timeline-item-remove {
      opacity: 1;
    }
  }

  .beat-slot .beat-empty {
    color: #c0c0d0;
    font-size: 12px;
  }
}

.editor-footer {
  padding: 16px 0;
  text-align: center;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  border-radius: 0 0 12px 12px;
}

.preview-info {
  text-align: center;
  margin-top: 16px;
  color: #2d2d3a;
  font-size: 14px;
}

.preview-timeline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;

  .preview-timeline-item {
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 13px;
    background: #f5f0ff;
    color: #6e6e8a;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: linear-gradient(135deg, #7c4dff, #e040fb);
      color: #fff;
      box-shadow: 0 2px 8px rgba(124, 77, 255, 0.4);
    }

    &:hover:not(.active) {
      background: #ede7ff;
    }
  }
}
</style>
