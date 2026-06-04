<template>
  <div class="choreography-list">
    <div class="page-header">
      <h2>编排组合</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建编排
      </el-button>
    </div>

    <el-table :data="choreographies" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="编排名称" min-width="150" />
      <el-table-column prop="totalBeats" label="总拍数" width="100" align="center">
        <template #default="{ row }">
          {{ row.totalBeats }}拍
        </template>
      </el-table-column>
      <el-table-column label="动作数量" width="100" align="center">
        <template #default="{ row }">
          {{ row.items?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="goEditor(row.id)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button type="success" size="small" @click="openShareDialog(row)">
            <el-icon><Share /></el-icon> 分享
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" title="新建编排" width="500px" destroy-on-close @close="resetForm">
      <el-form :model="createForm" label-width="80px" ref="formRef">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '请输入名称' }]">
          <el-input v-model="createForm.name" placeholder="请输入编排名称" />
        </el-form-item>
        <el-form-item label="总拍数" prop="totalBeats" :rules="[{ required: true, message: '请输入总拍数' }]">
          <el-input-number v-model="createForm.totalBeats" :min="4" :step="4" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="编排描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="shareDialogVisible" title="生成分享链接" width="450px" destroy-on-close>
      <div v-if="shareResult" style="text-align: center; padding: 20px;">
        <p style="margin-bottom: 12px; color: #6e6e8a;">分享链接已生成：</p>
        <el-input :model-value="shareResult.fullUrl" readonly>
          <template #append>
            <el-button @click="copyLink(shareResult.fullUrl)">复制</el-button>
          </template>
        </el-input>
        <p style="margin-top: 12px; color: #6e6e8a; font-size: 13px;">
          分享码：{{ shareResult.shareCode }}
        </p>
      </div>
      <template #footer>
        <el-button @click="shareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getChoreographies, createChoreography, deleteChoreography } from '@/api/choreography'
import { createShare } from '@/api/share'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const choreographies = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const creating = ref(false)
const formRef = ref(null)
const shareDialogVisible = ref(false)
const shareResult = ref(null)
const currentShareRow = ref(null)

const createForm = ref({
  name: '',
  totalBeats: 32,
  description: ''
})

async function loadChoreographies() {
  loading.value = true
  try {
    const res = await getChoreographies()
    choreographies.value = Array.isArray(res) ? res : res.records || res.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  createForm.value = { name: '', totalBeats: 32, description: '' }
}

async function handleCreate() {
  if (!formRef.value) return
  await formRef.value.validate()
  creating.value = true
  try {
    await createChoreography(createForm.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    resetForm()
    loadChoreographies()
  } catch (e) {
    console.error(e)
  } finally {
    creating.value = false
  }
}

function goEditor(id) {
  router.push(`/choreography/${id}`)
}

async function openShareDialog(row) {
  currentShareRow.value = row
  try {
    const res = await createShare(row.id)
    const shareCode = res.shareCode || res
    const fullUrl = `${window.location.origin}/share/${shareCode}`
    shareResult.value = { shareCode, fullUrl }
    shareDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除编排「${row.name}」吗？`, '提示', { type: 'warning' })
    await deleteChoreography(row.id)
    ElMessage.success('删除成功')
    loadChoreographies()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadChoreographies()
})
</script>
