<template>
  <div class="action-library">
    <div class="page-header">
      <h2>动作素材库</h2>
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Plus /></el-icon>
        上传动作
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="store.filters.name"
        placeholder="搜索动作名称"
        clearable
        @clear="loadActions"
        @keyup.enter="loadActions"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="store.filters.style" placeholder="风格" clearable @change="loadActions">
        <el-option label="街舞" value="street" />
        <el-option label="民族" value="folk" />
        <el-option label="现代" value="modern" />
        <el-option label="Jazz" value="jazz" />
      </el-select>
      <el-select v-model="store.filters.beat" placeholder="拍数" clearable @change="loadActions">
        <el-option label="4拍" value="4" />
        <el-option label="8拍" value="8" />
      </el-select>
      <el-select v-model="store.filters.difficulty" placeholder="难度" clearable @change="loadActions">
        <el-option v-for="i in 5" :key="i" :label="i" :value="i" />
      </el-select>
      <el-select v-model="store.filters.bodyPart" placeholder="身体部位" clearable @change="loadActions">
        <el-option label="全身" value="full" />
        <el-option label="上肢" value="upper" />
        <el-option label="下肢" value="lower" />
      </el-select>
      <el-button @click="resetAndLoad">重置</el-button>
      <el-button type="primary" @click="loadActions">搜索</el-button>
    </div>

    <el-row :gutter="16" v-loading="store.loading">
      <el-col :xs="12" :sm="8" :md="6" v-for="action in store.actions" :key="action.id">
        <div class="action-card" @click="playAction(action)">
          <div class="card-video-poster" v-if="!action.coverPath">
            <el-icon :size="40"><VideoPlay /></el-icon>
          </div>
          <img v-else :src="action.coverPath.replace('static/covers/', '/covers/')" class="card-video" :alt="action.name" />
          <div class="card-body">
            <div class="card-title">{{ action.name }}</div>
            <div class="card-tags">
              <el-tag size="small" type="primary">{{ styleMap[action.style] || action.style }}</el-tag>
              <el-tag size="small" type="success">{{ action.beat }}拍</el-tag>
              <el-tag size="small" type="warning">
                <el-icon v-for="n in action.difficulty" :key="n" :size="10"><StarFilled /></el-icon>
              </el-tag>
              <el-tag size="small" type="info">{{ bodyPartMap[action.bodyPart] || action.bodyPart }}</el-tag>
            </div>
          </div>
          <div class="card-actions" @click.stop>
            <el-button
              type="danger"
              size="small"
              text
              @click="handleDelete(action)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!store.loading && store.actions.length === 0" description="暂无动作素材" />

    <el-pagination
      v-model:current-page="store.pagination.page"
      v-model:page-size="store.pagination.pageSize"
      :total="store.pagination.total"
      :page-sizes="[8, 12, 24]"
      layout="total, sizes, prev, pager, next"
      @current-change="loadActions"
      @size-change="loadActions"
    />

    <el-dialog v-model="playDialogVisible" :title="currentAction?.name" width="700px" destroy-on-close>
      <div class="video-player-container" v-if="currentAction">
        <video :src="getVideoUrl(currentAction)" controls autoplay />
      </div>
    </el-dialog>

    <el-dialog v-model="showUploadDialog" title="上传动作素材" width="600px" destroy-on-close @close="resetForm">
      <el-form :model="uploadForm" label-width="80px" ref="formRef">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '请输入名称' }]">
          <el-input v-model="uploadForm.name" placeholder="请输入动作名称" />
        </el-form-item>
        <el-form-item label="视频文件" prop="videoFile" :rules="[{ required: true, message: '请上传视频' }]">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept="video/*"
            drag
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon :size="48"><UploadFilled /></el-icon>
            <div>将视频拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="风格" prop="style" :rules="[{ required: true, message: '请选择风格' }]">
          <el-select v-model="uploadForm.style" placeholder="请选择">
            <el-option label="街舞" value="street" />
            <el-option label="民族" value="folk" />
            <el-option label="现代" value="modern" />
            <el-option label="Jazz" value="jazz" />
          </el-select>
        </el-form-item>
        <el-form-item label="拍数" prop="beat" :rules="[{ required: true, message: '请选择拍数' }]">
          <el-select v-model="uploadForm.beat" placeholder="请选择">
            <el-option label="4拍" :value="4" />
            <el-option label="8拍" :value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-rate v-model="uploadForm.difficulty" :max="5" />
        </el-form-item>
        <el-form-item label="身体部位" prop="bodyPart" :rules="[{ required: true, message: '请选择身体部位' }]">
          <el-select v-model="uploadForm.bodyPart" placeholder="请选择">
            <el-option label="全身" value="full" />
            <el-option label="上肢" value="upper" />
            <el-option label="下肢" value="lower" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="动作描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">确认上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useActionStore } from '@/stores/action'
import { getActions, createAction, uploadVideo, deleteAction } from '@/api/action'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useActionStore()
const playDialogVisible = ref(false)
const showUploadDialog = ref(false)
const currentAction = ref(null)
const uploading = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const videoFile = ref(null)

const uploadForm = ref({
  name: '',
  style: '',
  beat: null,
  difficulty: 3,
  bodyPart: '',
  description: ''
})

const styleMap = { street: '街舞', folk: '民族', modern: '现代', jazz: 'Jazz' }
const bodyPartMap = { full: '全身', upper: '上肢', lower: '下肢' }

function getVideoUrl(action) {
  if (!action.videoPath) return ''
  const filename = action.videoPath.replace('static/videos/', '')
  return `/videos/${filename}`
}

async function loadActions() {
  store.loading = true
  try {
    const params = {
      page: store.pagination.page,
      pageSize: store.pagination.pageSize,
      ...store.filters
    }
    const res = await getActions(params)
    store.actions = Array.isArray(res) ? res : res.records || res.list || []
    store.pagination.total = store.actions.length
  } catch (e) {
    console.error(e)
  } finally {
    store.loading = false
  }
}

function resetAndLoad() {
  store.resetFilters()
  loadActions()
}

function playAction(action) {
  currentAction.value = action
  playDialogVisible.value = true
}

function handleFileChange(file) {
  videoFile.value = file.raw
}

function handleFileRemove() {
  videoFile.value = null
}

function resetForm() {
  uploadForm.value = {
    name: '',
    style: '',
    beat: null,
    difficulty: 3,
    bodyPart: '',
    description: ''
  }
  videoFile.value = null
}

async function handleUpload() {
  if (!formRef.value) return
  await formRef.value.validate()

  if (!videoFile.value) {
    ElMessage.warning('请选择视频文件')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', videoFile.value)
    const videoPath = await uploadVideo(formData)

    await createAction({
      name: uploadForm.value.name,
      videoPath: videoPath,
      style: uploadForm.value.style,
      beat: uploadForm.value.beat,
      difficulty: uploadForm.value.difficulty,
      bodyPart: uploadForm.value.bodyPart,
      description: uploadForm.value.description
    })

    ElMessage.success('上传成功')
    showUploadDialog.value = false
    resetForm()
    loadActions()
  } catch (e) {
    console.error(e)
  } finally {
    uploading.value = false
  }
}

async function handleDelete(action) {
  try {
    await ElMessageBox.confirm(`确定删除动作「${action.name}」吗？`, '提示', {
      type: 'warning'
    })
    await deleteAction(action.id)
    ElMessage.success('删除成功')
    loadActions()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadActions()
})
</script>

<style lang="scss" scoped>
.action-library {
  .card-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .action-card {
    position: relative;
    cursor: pointer;
    margin-bottom: 16px;

    &:hover .card-actions {
      opacity: 1;
    }
  }
}
</style>
