<template>
  <div class="car-detail-page">
    <div class="page-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="goBack"
        class="back-button"
      >
        返回列表
      </el-button>
      <div v-loading="carStore.loading" class="car-header-info">
        <div class="car-icon-wrapper">
          <el-icon class="car-icon"><VintageCar /></el-icon>
        </div>
        <div class="car-main-info">
          <h2 class="retro-title car-name">{{ currentCar?.name }}</h2>
          <div class="car-meta">
            <span class="meta-item">
              <el-icon><Collection /></el-icon>
              {{ currentCar?.brand }} {{ currentCar?.model }} {{ currentCar?.year }}
            </span>
            <el-tag
              :type="getRouteTagType(currentCar?.restoration_route)"
              size="default"
              effect="light"
            >
              {{ getRouteText(currentCar?.restoration_route) }}
            </el-tag>
          </div>
          <p v-if="currentCar?.description" class="car-description">
            {{ currentCar.description }}
          </p>
        </div>
        <div class="car-progress-card">
          <div class="progress-circle">
            <el-progress
              type="dashboard"
              :percentage="overallProgress"
              :width="120"
              :stroke-width="10"
              :show-text="true"
              :color="getProgressColor(overallProgress)"
              format="(percentage)%"
            />
          </div>
          <div class="progress-label">总体修复进度</div>
        </div>
      </div>
    </div>

    <div v-loading="carStore.loading" class="detail-content">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="工序进度" name="processes">
          <template #label>
            <span class="tab-label">
              <el-icon><Tools /></el-icon>
              工序进度
              <el-badge :value="processStore.processes.length" class="tab-badge" />
            </span>
          </template>
          <div class="tab-content">
            <div class="content-header">
              <h3 class="section-title">
                <el-icon><Operation /></el-icon>
                修复工序时间线
              </h3>
              <div class="status-legend">
                <div class="legend-item">
                  <span class="legend-dot completed"></span>
                  已完成
                </div>
                <div class="legend-item">
                  <span class="legend-dot in-progress"></span>
                  进行中
                </div>
                <div class="legend-item">
                  <span class="legend-dot pending"></span>
                  待开始
                </div>
                <div class="legend-item">
                  <span class="legend-dot locked"></span>
                  已锁定
                </div>
              </div>
            </div>
            <ProcessTimeline
              :processes="processStore.processes"
              :loading="processStore.loading"
              @status-change="handleProcessStatusChange"
              @sub-task-status-change="handleSubTaskStatusChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="零件管理" name="parts">
          <template #label>
            <span class="tab-label">
              <el-icon><SetUp /></el-icon>
              零件管理
              <el-badge :value="partStore.parts.length" class="tab-badge" />
            </span>
          </template>
          <div class="tab-content">
            <PartTable
              :parts="partStore.parts"
              :car-id="carId"
              :loading="partStore.loading"
              @add="handleAddPart"
              @edit="handleEditPart"
              @delete="handleDeletePart"
              @status-change="handlePartStatusChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="修复日志" name="logs">
          <template #label>
            <span class="tab-label">
              <el-icon><Notebook /></el-icon>
              修复日志
              <el-badge :value="repairLogStore.repairLogs.length" class="tab-badge" />
            </span>
          </template>
          <div class="tab-content">
            <div class="content-header">
              <h3 class="section-title">
                <el-icon><Document /></el-icon>
                修复记录时间线
              </h3>
              <el-button type="primary" @click="showAddLogDialog">
                <el-icon><Plus /></el-icon>
                添加日志
              </el-button>
            </div>
            <RepairLogTimeline
              :logs="repairLogStore.sortedLogs"
              :loading="repairLogStore.loading"
              @edit="handleEditLog"
              @delete="handleDeleteLog"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="addLogDialogVisible"
      title="添加修复日志"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="logForm" :rules="logRules" ref="logFormRef" label-width="80px">
        <el-form-item label="日期" prop="log_date">
          <el-date-picker
            v-model="logForm.log_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="logForm.content"
            type="textarea"
            :rows="6"
            placeholder="请详细描述本次修复工作..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addLogDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddLog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, VintageCar, Tools, SetUp, Notebook, Document, Plus, Collection, Operation } from '@element-plus/icons-vue'
import { useCarStore, useProcessStore, usePartStore, useRepairLogStore } from '@/stores'
import { partsApi, repairLogsApi, processesApi, subTasksApi } from '@/api'
import { RestorationRouteText, ProcessStatus, type Process, type SubTask, type RepairLog } from '@/types'
import ProcessTimeline from '@/components/ProcessTimeline.vue'
import RepairLogTimeline from '@/components/RepairLogTimeline.vue'
import PartTable from '@/components/PartTable.vue'

const route = useRoute()
const router = useRouter()
const carStore = useCarStore()
const processStore = useProcessStore()
const partStore = usePartStore()
const repairLogStore = useRepairLogStore()

const carId = computed(() => Number(route.params.id))
const currentCar = computed(() => carStore.currentCar)
const activeTab = ref('processes')
const addLogDialogVisible = ref(false)
const logFormRef = ref<FormInstance>()

const logForm = reactive({
  log_date: new Date().toISOString().split('T')[0],
  content: ''
})

const logRules: FormRules = {
  log_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  content: [{ required: true, message: '请输入日志内容', trigger: 'blur' }]
}

const overallProgress = computed(() => {
  const processes = processStore.processes
  if (processes.length === 0) return 0
  const completed = processes.filter(p => p.status === 'completed').length
  return Math.round((completed / processes.length) * 100)
})

onMounted(() => {
  loadCarDetails()
})

async function loadCarDetails() {
  try {
    await Promise.all([
      carStore.fetchCarWithDetails(carId.value),
      processStore.fetchProcessesByCarId(carId.value),
      partStore.fetchPartsByCarId(carId.value),
      repairLogStore.fetchRepairLogsByCarId(carId.value)
    ])
  } catch (error) {
    console.error('Failed to load car details:', error)
  }
}

function goBack() {
  router.push('/')
}

function getRouteText(route?: string) {
  if (!route) return ''
  return RestorationRouteText[route as keyof typeof RestorationRouteText] || route
}

function getRouteTagType(route?: string) {
  switch (route) {
    case 'full_restoration': return 'warning'
    case 'partial_restoration': return 'info'
    case 'modification': return 'success'
    case 'maintenance': return 'info'
    default: return 'info'
  }
}

function getProgressColor(percent: number) {
  if (percent >= 80) return '#6b8e50'
  if (percent >= 50) return '#c9951a'
  if (percent >= 20) return '#a67c52'
  return '#8b5a2b'
}

async function handleProcessStatusChange(process: Process, newStatus: ProcessStatus) {
  try {
    const updateData: any = { status: newStatus }
    if (newStatus === ProcessStatus.IN_PROGRESS && !process.start_date) {
      updateData.start_date = new Date().toISOString().split('T')[0]
    }
    if (newStatus === ProcessStatus.COMPLETED) {
      updateData.end_date = new Date().toISOString().split('T')[0]
    }
    await processesApi.update(process.id, updateData)
    await processStore.fetchProcessesByCarId(carId.value)
    ElMessage.success('工序状态已更新')
  } catch (error) {
    console.error('Failed to update process status:', error)
  }
}

async function handleSubTaskStatusChange(_process: Process, subTask: SubTask, newStatus: ProcessStatus) {
  try {
    await subTasksApi.updateStatus(subTask.id, newStatus)
    await processStore.fetchProcessesByCarId(carId.value)
    ElMessage.success('子任务状态已更新')
  } catch (error) {
    console.error('Failed to update subtask status:', error)
  }
}

async function handleAddPart(data: any) {
  try {
    await partsApi.create(data)
    await partStore.fetchPartsByCarId(carId.value)
    ElMessage.success('零件添加成功')
  } catch (error) {
    console.error('Failed to add part:', error)
  }
}

async function handleEditPart(id: number, data: any) {
  try {
    await partsApi.update(id, data)
    await partStore.fetchPartsByCarId(carId.value)
    ElMessage.success('零件更新成功')
  } catch (error) {
    console.error('Failed to update part:', error)
  }
}

async function handleDeletePart(id: number) {
  try {
    await partsApi.remove(id)
    await partStore.fetchPartsByCarId(carId.value)
    ElMessage.success('零件删除成功')
  } catch (error) {
    console.error('Failed to delete part:', error)
  }
}

async function handlePartStatusChange(id: number, status: string) {
  try {
    await partsApi.updateStatus(id, status)
    await partStore.fetchPartsByCarId(carId.value)
    ElMessage.success('零件状态已更新')
  } catch (error) {
    console.error('Failed to update part status:', error)
  }
}

function showAddLogDialog() {
  logForm.log_date = new Date().toISOString().split('T')[0]
  logForm.content = ''
  addLogDialogVisible.value = true
}

async function handleAddLog() {
  if (!logFormRef.value) return
  await logFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await repairLogsApi.create({
          ...logForm,
          car_id: carId.value
        })
        await repairLogStore.fetchRepairLogsByCarId(carId.value)
        addLogDialogVisible.value = false
        ElMessage.success('日志添加成功')
      } catch (error) {
        console.error('Failed to add log:', error)
      }
    }
  })
}

async function handleEditLog(log: RepairLog) {
  try {
    await repairLogsApi.update(log.id, {
      log_date: log.log_date,
      content: log.content
    })
    await repairLogStore.fetchRepairLogsByCarId(carId.value)
    ElMessage.success('日志更新成功')
  } catch (error) {
    console.error('Failed to update log:', error)
  }
}

async function handleDeleteLog(id: number) {
  try {
    await repairLogsApi.remove(id)
    await repairLogStore.fetchRepairLogsByCarId(carId.value)
    ElMessage.success('日志删除成功')
  } catch (error) {
    console.error('Failed to delete log:', error)
  }
}
</script>

<style scoped>
.car-detail-page {
  width: 100%;
}

.page-header {
  margin-bottom: 30px;
}

.back-button {
  margin-bottom: 20px;
}

.car-header-info {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(145deg, var(--retro-bg-medium), var(--retro-bg-dark));
  border: 2px solid var(--retro-border);
  border-radius: 12px;
  flex-wrap: wrap;
}

.car-icon-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--retro-brown-dark), var(--retro-brown));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--retro-gold);
  flex-shrink: 0;
}

.car-icon {
  font-size: 3.5rem;
  color: var(--retro-gold);
}

.car-main-info {
  flex: 1;
  min-width: 300px;
}

.car-name {
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.car-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--retro-text-secondary);
  font-size: 1rem;
}

.meta-item .el-icon {
  color: var(--retro-gold);
}

.car-description {
  color: var(--retro-text-secondary);
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

.car-progress-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid var(--retro-border);
}

.progress-circle {
  :deep(.el-progress__text) {
    font-size: 1.5rem !important;
    font-weight: bold;
    color: var(--retro-gold) !important;
  }
}

.progress-label {
  color: var(--retro-text-secondary);
  font-size: 0.9rem;
}

.detail-content {
  background: linear-gradient(145deg, var(--retro-bg-medium), var(--retro-bg-dark));
  border: 2px solid var(--retro-border);
  border-radius: 12px;
  padding: 20px;
}

.detail-tabs {
  :deep(.el-tabs__item) {
    font-size: 1rem;
    padding: 0 24px;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-badge {
  margin-left: 4px;
}

.tab-content {
  padding-top: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--retro-gold);
  font-size: 1.3rem;
  margin: 0;
}

.section-title .el-icon {
  font-size: 1.5rem;
}

.status-legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--retro-text-secondary);
  font-size: 0.9rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.completed {
  background: var(--retro-success);
}

.legend-dot.in-progress {
  background: var(--retro-warning);
}

.legend-dot.pending {
  background: var(--retro-border);
}

.legend-dot.locked {
  background: var(--retro-bg-dark);
  border: 2px solid var(--retro-border);
}

@media (max-width: 768px) {
  .car-header-info {
    flex-direction: column;
    text-align: center;
  }

  .car-main-info {
    min-width: 100%;
  }

  .car-meta {
    justify-content: center;
  }

  .car-name {
    font-size: 1.5rem;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-legend {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
