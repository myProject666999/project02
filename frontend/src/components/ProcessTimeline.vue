<template>
  <div class="process-timeline">
    <div v-loading="loading" class="timeline-container">
      <div v-if="sortedProcesses.length === 0" class="empty-state">
        <el-empty description="暂无工序数据" />
      </div>
      <div v-else class="timeline-steps">
        <div
          v-for="(process, index) in sortedProcesses"
          :key="process.id"
          class="timeline-step"
          :class="{
            'is-completed': process.status === 'completed',
            'is-in-progress': process.status === 'in_progress',
            'is-pending': process.status === 'pending',
            'is-locked': isLocked(process)
          }"
        >
          <div class="step-connector" v-if="index > 0">
            <div class="connector-line" :class="{ 'is-active': process.status !== 'pending' && !isLocked(process) }"></div>
          </div>
          <div class="step-node" @click="handleStepClick(process)">
            <div class="node-icon">
              <el-icon v-if="process.status === 'completed'" class="icon-check"><Check /></el-icon>
              <el-icon v-else-if="process.status === 'in_progress'" class="icon-loading"><Loading /></el-icon>
              <el-icon v-else-if="isLocked(process)" class="icon-lock"><Lock /></el-icon>
              <span v-else class="node-number">{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-header">
                <h4 class="step-title">{{ process.name }}</h4>
                <el-tag
                  :type="getStatusTagType(process.status, isLocked(process))"
                  size="small"
                  effect="light"
                >
                  {{ getStatusText(process.status, isLocked(process)) }}
                </el-tag>
              </div>
              <p v-if="process.description" class="step-description">{{ process.description }}</p>
              <div class="step-dates">
                <span v-if="process.start_date" class="date-item">
                  <el-icon><Calendar /></el-icon>
                  开始: {{ formatDate(process.start_date) }}
                </span>
                <span v-if="process.end_date" class="date-item">
                  <el-icon><Calendar /></el-icon>
                  完成: {{ formatDate(process.end_date) }}
                </span>
              </div>
              <div v-if="process.subTasks && process.subTasks.length > 0" class="sub-tasks">
                <div
                  v-for="subTask in process.subTasks"
                  :key="subTask.id"
                  class="sub-task-item"
                >
                  <el-checkbox
                    :model-value="subTask.status === 'completed'"
                    :disabled="isLocked(process) || process.status === 'pending'"
                    @change="handleSubTaskChange(process, subTask, $event)"
                  >
                    {{ subTask.name }}
                  </el-checkbox>
                  <el-tag
                    v-if="subTask.status === 'in_progress'"
                    type="warning"
                    size="small"
                    effect="light"
                  >
                    进行中
                  </el-tag>
                </div>
              </div>
              <div v-if="!isLocked(process) && process.status !== 'completed'" class="step-actions">
                <el-button
                  v-if="process.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="startProcess(process)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始工序
                </el-button>
                <el-button
                  v-if="process.status === 'in_progress'"
                  type="success"
                  size="small"
                  @click="completeProcess(process)"
                >
                  <el-icon><Check /></el-icon>
                  完成工序
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProcessStore } from '@/stores'
import { ProcessStatus, ProcessStatusText } from '@/types'
import type { Process, SubTask } from '@/types'

const props = defineProps<{
  processes: Process[]
  loading?: boolean
}>()

const emit = defineEmits<{
  processClick: [process: Process]
  statusChange: [process: Process, newStatus: ProcessStatus]
  subTaskStatusChange: [process: Process, subTask: SubTask, newStatus: ProcessStatus]
}>()

const processStore = useProcessStore()

const sortedProcesses = computed(() => {
  return [...props.processes].sort((a, b) => a.process_order - b.process_order)
})

function isLocked(process: Process): boolean {
  return processStore.isProcessLocked(process)
}

function getStatusTagType(status: string, locked: boolean) {
  if (locked) return 'info'
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'warning'
    default: return 'info'
  }
}

function getStatusText(status: string, locked: boolean) {
  if (locked) return '已锁定'
  return ProcessStatusText[status as ProcessStatus] || status
}

function formatDate(date: Date | null | string): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

function handleStepClick(process: Process) {
  emit('processClick', process)
}

async function handleSubTaskChange(process: Process, subTask: SubTask, checked: boolean) {
  try {
    const newStatus = checked ? ProcessStatus.COMPLETED : ProcessStatus.IN_PROGRESS
    emit('subTaskStatusChange', process, subTask, newStatus)
  } catch (error) {
    console.error('Failed to update subtask:', error)
  }
}

async function startProcess(process: Process) {
  try {
    await ElMessageBox.confirm(
      `确定要开始工序"${process.name}"吗？`,
      '确认开始',
      {
        confirmButtonText: '开始',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('statusChange', process, ProcessStatus.IN_PROGRESS)
    ElMessage.success(`工序"${process.name}"已开始`)
  } catch {
  }
}

async function completeProcess(process: Process) {
  try {
    await ElMessageBox.confirm(
      `确定要完成工序"${process.name}"吗？完成后将解锁下一道工序。`,
      '确认完成',
      {
        confirmButtonText: '完成',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    emit('statusChange', process, ProcessStatus.COMPLETED)
    ElMessage.success(`工序"${process.name}"已完成`)
  } catch {
  }
}
</script>

<style scoped>
.process-timeline {
  width: 100%;
}

.timeline-container {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.timeline-steps {
  position: relative;
  padding-left: 40px;
}

.timeline-step {
  position: relative;
  margin-bottom: 30px;
}

.timeline-step:last-child {
  margin-bottom: 0;
}

.step-connector {
  position: absolute;
  left: -30px;
  top: 0;
  bottom: 0;
  width: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connector-line {
  width: 2px;
  height: 100%;
  background: var(--retro-border);
  transition: all 0.3s ease;
}

.connector-line.is-active {
  background: var(--retro-gold);
}

.step-node {
  display: flex;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 15px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid transparent;
}

.step-node:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--retro-gold);
}

.node-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--retro-bg-dark);
  border: 3px solid var(--retro-border);
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--retro-text-secondary);
  transition: all 0.3s ease;
}

.timeline-step.is-completed .node-icon {
  background: var(--retro-success);
  border-color: var(--retro-success);
  color: var(--retro-cream);
}

.timeline-step.is-in-progress .node-icon {
  background: var(--retro-warning);
  border-color: var(--retro-warning);
  color: var(--retro-cream);
  animation: pulse 2s infinite;
}

.timeline-step.is-locked .node-icon {
  background: var(--retro-bg-dark);
  border-color: var(--retro-border);
  color: var(--retro-text-secondary);
  opacity: 0.6;
}

.icon-check,
.icon-loading,
.icon-lock {
  font-size: 1.5rem;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(201, 149, 26, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(201, 149, 26, 0);
  }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.step-title {
  font-size: 1.15rem;
  color: var(--retro-gold);
  margin: 0;
  font-weight: bold;
}

.timeline-step.is-locked .step-title {
  color: var(--retro-text-secondary);
  opacity: 0.6;
}

.step-description {
  color: var(--retro-text-secondary);
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.step-dates {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--retro-text-secondary);
  font-size: 0.85rem;
}

.date-item .el-icon {
  color: var(--retro-gold);
}

.sub-tasks {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.sub-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sub-task-item:last-child {
  border-bottom: none;
}

.sub-task-item :deep(.el-checkbox__label) {
  color: var(--retro-text-primary);
}

.sub-task-item :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--retro-success);
  border-color: var(--retro-success);
}

.step-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .timeline-steps {
    padding-left: 30px;
  }

  .step-connector {
    left: -22px;
  }

  .node-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .step-node {
    flex-direction: column;
    gap: 12px;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .step-dates {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
