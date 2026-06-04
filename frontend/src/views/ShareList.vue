<template>
  <div class="share-list">
    <div class="page-header">
      <h2>分享管理</h2>
      <el-button type="primary" @click="openGenerateDialog">
        <el-icon><Plus /></el-icon>
        生成分享链接
      </el-button>
    </div>

    <el-table :data="shares" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="choreographyName" label="编排名称" min-width="140" />
      <el-table-column prop="shareCode" label="分享码" width="120" />
      <el-table-column label="分享链接" min-width="250">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="copyLink(getFullUrl(row.shareCode))">
            {{ getFullUrl(row.shareCode) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
            {{ row.isActive ? '有效' : '已停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="过期时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" text @click="copyLink(getFullUrl(row.shareCode))">
            <el-icon><CopyDocument /></el-icon> 复制
          </el-button>
          <el-button
            v-if="row.isActive"
            type="warning"
            size="small"
            text
            @click="handleDeactivate(row)"
          >
            <el-icon><Lock /></el-icon> 停用
          </el-button>
          <el-button type="danger" size="small" text @click="handleDelete(row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="generateDialogVisible" title="生成分享链接" width="500px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="选择编排">
          <el-select v-model="selectedChoreographyId" placeholder="请选择编排" style="width: 100%">
            <el-option
              v-for="c in choreographies"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="handleGenerate">生成</el-button>
      </template>
      <div v-if="generatedLink" class="generated-result">
        <p>分享链接已生成：</p>
        <el-input :model-value="generatedLink" readonly>
          <template #append>
            <el-button @click="copyLink(generatedLink)">复制</el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getChoreographies } from '@/api/choreography'
import { createShare, deactivateShare, getShares } from '@/api/share'
import { ElMessage, ElMessageBox } from 'element-plus'

const shares = ref([])
const loading = ref(false)
const generateDialogVisible = ref(false)
const generating = ref(false)
const choreographies = ref([])
const selectedChoreographyId = ref(null)
const generatedLink = ref(null)

function getFullUrl(code) {
  return `${window.location.origin}/share/${code}`
}

async function loadShares() {
  loading.value = true
  try {
    const res = await getShares()
    shares.value = Array.isArray(res) ? res : []
    const choreoRes = await getChoreographies()
    choreographies.value = Array.isArray(choreoRes) ? choreoRes : choreoRes.records || choreoRes.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openGenerateDialog() {
  generatedLink.value = null
  selectedChoreographyId.value = null
  generateDialogVisible.value = true
}

async function handleGenerate() {
  if (!selectedChoreographyId.value) {
    ElMessage.warning('请选择编排')
    return
  }
  generating.value = true
  try {
    const res = await createShare(selectedChoreographyId.value)
    const code = res.shareCode || res
    generatedLink.value = getFullUrl(code)
    loadShares()
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
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

async function handleDeactivate(row) {
  try {
    await ElMessageBox.confirm('确定停用该分享链接吗？', '提示', { type: 'warning' })
    await deactivateShare(row.id)
    ElMessage.success('已停用')
    loadShares()
  } catch {
    // cancelled
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定删除该分享记录吗？', '提示', { type: 'warning' })
    await deactivateShare(row.id)
    ElMessage.success('已删除')
    loadShares()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  loadShares()
})
</script>

<style lang="scss" scoped>
.generated-result {
  margin-top: 16px;
  padding: 16px;
  background: #f5f0ff;
  border-radius: 8px;

  p {
    margin-bottom: 8px;
    color: #2d2d3a;
    font-weight: 600;
  }
}
</style>
