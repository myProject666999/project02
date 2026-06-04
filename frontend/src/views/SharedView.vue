<template>
  <div class="shared-view">
    <div class="shared-header">
      <div class="header-brand">
        <el-icon :size="28"><VideoCamera /></el-icon>
        <span>舞蹈编排分享</span>
      </div>
    </div>

    <div class="shared-content" v-loading="loading">
      <template v-if="choreography">
        <div class="choreography-info">
          <h1>{{ choreography.name }}</h1>
          <p v-if="choreography.description" class="description">{{ choreography.description }}</p>
          <div class="meta">
            <el-tag type="primary">{{ choreography.totalBeats }}拍</el-tag>
            <el-tag type="success">{{ items.length }}个动作</el-tag>
          </div>
        </div>

        <div class="shared-timeline">
          <h3>动作序列</h3>
          <div class="timeline-track">
            <div
              v-for="(item, index) in items"
              :key="index"
              class="timeline-card"
              :class="{ active: index === currentPlayIndex }"
              @click="jumpTo(index)"
            >
              <div class="timeline-card-index">{{ index + 1 }}</div>
              <div class="timeline-card-name">{{ item.actionName || item.name }}</div>
              <div class="timeline-card-beat">第{{ item.beatPosition || index + 1 }}个8拍</div>
            </div>
          </div>
        </div>

        <div class="shared-player">
          <div class="video-player-container">
            <video
              ref="videoRef"
              :src="currentVideoUrl"
              controls
              @ended="onVideoEnded"
            />
          </div>
          <div class="player-info">
            <span class="player-current">{{ currentPlayName }}</span>
            <span class="player-progress">{{ currentPlayIndex + 1 }} / {{ items.length }}</span>
          </div>
          <div class="player-controls">
            <el-button :disabled="currentPlayIndex <= 0" @click="prevVideo">
              <el-icon><ArrowLeft /></el-icon> 上一个
            </el-button>
            <el-button type="primary" @click="togglePlay">
              <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button :disabled="currentPlayIndex >= items.length - 1" @click="nextVideo">
              下一个 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="分享内容不存在或已失效" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedChoreography } from '@/api/share'

const route = useRoute()
const shareCode = route.params.code

const loading = ref(false)
const choreography = ref(null)
const items = ref([])
const currentPlayIndex = ref(0)
const isPlaying = ref(false)
const videoRef = ref(null)

function getVideoUrl(path) {
  if (!path) return ''
  const filename = path.replace('static/videos/', '')
  return `/videos/${filename}`
}

const currentVideoUrl = computed(() => {
  if (items.value.length === 0) return ''
  return getVideoUrl(items.value[currentPlayIndex.value]?.videoPath)
})

const currentPlayName = computed(() => {
  if (items.value.length === 0) return ''
  return items.value[currentPlayIndex.value]?.actionName || items.value[currentPlayIndex.value]?.name || ''
})

async function loadData() {
  loading.value = true
  try {
    const res = await getSharedChoreography(shareCode)
    choreography.value = res
    items.value = res.items || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function jumpTo(index) {
  currentPlayIndex.value = index
  isPlaying.value = true
}

function prevVideo() {
  if (currentPlayIndex.value > 0) {
    currentPlayIndex.value--
  }
}

function nextVideo() {
  if (currentPlayIndex.value < items.value.length - 1) {
    currentPlayIndex.value++
  }
}

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
  } else {
    videoRef.value.play()
    isPlaying.value = true
  }
}

function onVideoEnded() {
  isPlaying.value = false
  if (currentPlayIndex.value < items.value.length - 1) {
    currentPlayIndex.value++
    isPlaying.value = true
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
$primary: #7c4dff;
$accent: #e040fb;
$bg-dark: #1a1a2e;

.shared-view {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-dark 0%, #2d2d5e 40%, #f5f0ff 40%);
}

.shared-header {
  padding: 20px 40px;

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
}

.shared-content {
  max-width: 960px;
  margin: -40px auto 0;
  padding: 0 24px 40px;
}

.choreography-info {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, $primary, $accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }

  .description {
    color: #6e6e8a;
    font-size: 15px;
    margin-bottom: 16px;
  }

  .meta {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}

.shared-timeline {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #2d2d3a;
  }

  .timeline-track {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: $primary;
      border-radius: 2px;
    }
  }

  .timeline-card {
    min-width: 110px;
    padding: 14px;
    border-radius: 12px;
    border: 2px solid #ebeef5;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
      border-color: $primary;
      background: rgba(124, 77, 255, 0.04);
    }

    &.active {
      border-color: $primary;
      background: linear-gradient(135deg, rgba(124, 77, 255, 0.1), rgba(224, 64, 251, 0.05));
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.3);
    }

    .timeline-card-index {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, $primary, $accent);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px;
    }

    .timeline-card-name {
      font-size: 13px;
      font-weight: 600;
      color: #2d2d3a;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }

    .timeline-card-beat {
      font-size: 11px;
      color: #6e6e8a;
    }
  }
}

.shared-player {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .player-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 0 8px;

    .player-current {
      font-size: 15px;
      font-weight: 600;
      color: #2d2d3a;
    }

    .player-progress {
      font-size: 13px;
      color: #6e6e8a;
    }
  }

  .player-controls {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
  }
}
</style>
