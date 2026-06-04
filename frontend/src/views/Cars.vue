<template>
  <div class="cars-page">
    <div class="page-header">
      <h2 class="retro-title page-title">
        <el-icon class="title-icon"><Garage /></el-icon>
        修复车辆列表
      </h2>
      <p class="page-subtitle">选择一辆车查看详细修复进度</p>
    </div>

    <div v-loading="carStore.loading" class="cars-grid">
      <div v-if="carStore.cars.length === 0" class="empty-state">
        <el-empty description="暂无车辆数据" />
      </div>
      <el-row :gutter="24">
        <el-col
          v-for="car in carStore.cars"
          :key="car.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="car-col"
        >
          <el-card
            class="car-card retro-card"
            :body-style="{ padding: '0' }"
            @click="goToDetail(car.id)"
          >
            <div class="card-image">
              <div class="image-placeholder">
                <el-icon class="car-icon"><VintageCar /></el-icon>
              </div>
              <div class="card-overlay">
                <span class="click-hint">
                  <el-icon><View /></el-icon>
                  查看详情
                </span>
              </div>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="car-name">{{ car.name }}</h3>
                <el-tag
                  :type="getRouteTagType(car.restoration_route)"
                  size="small"
                  effect="light"
                >
                  {{ getRouteText(car.restoration_route) }}
                </el-tag>
              </div>
              <div class="car-info">
                <div class="info-item">
                  <span class="info-label">品牌</span>
                  <span class="info-value">{{ car.brand }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">型号</span>
                  <span class="info-value">{{ car.model }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">年份</span>
                  <span class="info-value">{{ car.year }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">VIN</span>
                  <span class="info-value vin">{{ car.vin }}</span>
                </div>
              </div>
              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-label">修复进度</span>
                  <span class="progress-percent">{{ getProgress(car) }}%</span>
                </div>
                <el-progress
                  :percentage="getProgress(car)"
                  :show-text="false"
                  :stroke-width="8"
                  :color="getProgressColor(getProgress(car))"
                />
              </div>
              <div class="progress-stats">
                <div class="stat">
                  <el-icon><Tools /></el-icon>
                  <span>{{ car.processes?.length || 0 }} 工序</span>
                </div>
                <div class="stat">
                  <el-icon><SetUp /></el-icon>
                  <span>{{ car.parts?.length || 0 }} 零件</span>
                </div>
                <div class="stat">
                  <el-icon><Notebook /></el-icon>
                  <span>{{ car.repairLogs?.length || 0 }} 日志</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores'
import { RestorationRouteText, type Car } from '@/types'

const router = useRouter()
const carStore = useCarStore()

onMounted(() => {
  loadCars()
})

async function loadCars() {
  await carStore.fetchCars()
}

function goToDetail(id: number) {
  router.push(`/car/${id}`)
}

function getRouteText(route: string) {
  return RestorationRouteText[route as keyof typeof RestorationRouteText] || route
}

function getRouteTagType(route: string) {
  switch (route) {
    case 'full_restoration': return 'warning'
    case 'partial_restoration': return 'info'
    case 'modification': return 'success'
    case 'maintenance': return 'info'
    default: return 'info'
  }
}

function getProgress(car: Car): number {
  if (!car.processes && car.processes.length === 0) return 0
  const processes = car.processes || []
  if (processes.length === 0) return 0
  const completed = processes.filter(p => p.status === 'completed').length
  return Math.round((completed / processes.length) * 100)
}

function getProgressColor(percent: number) {
  if (percent >= 80) return '#6b8e50'
  if (percent >= 50) return '#c9951a'
  if (percent >= 20) return '#a67c52'
  return '#8b5a2b'
}
</script>

<style scoped>
.cars-page {
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 8px;
}

.title-icon {
  font-size: 2.5rem;
  color: var(--retro-gold);
}

.page-subtitle {
  color: var(--retro-text-secondary);
  font-style: italic;
  font-size: 1.05rem;
}

.cars-grid {
  padding: 10px;
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
}

.car-col {
  margin-bottom: 24px;
}

.car-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.car-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5);
  border-color: var(--retro-gold) !important;
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--retro-brown-dark), var(--retro-bg-medium));
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-icon {
  font-size: 4rem;
  color: var(--retro-gold);
  opacity: 0.8;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.car-card:hover .card-overlay {
  opacity: 1;
}

.click-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--retro-gold);
  font-size: 1.1rem;
  font-weight: bold;
}

.card-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.car-name {
  font-size: 1.3rem;
  color: var(--retro-gold);
  margin: 0;
  font-weight: bold;
}

.car-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.8rem;
  color: var(--retro-text-secondary);
}

.info-value {
  font-size: 0.95rem;
  color: var(--retro-text-primary);
  font-weight: 500;
}

.info-value.vin {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  color: var(--retro-text-secondary);
  font-size: 0.9rem;
}

.progress-percent {
  color: var(--retro-gold);
  font-weight: bold;
  font-size: 1.1rem;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid var(--retro-border);
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--retro-text-secondary);
  font-size: 0.85rem;
}

.stat .el-icon {
  color: var(--retro-gold);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 10px;
  }

  .title-icon {
    font-size: 2rem;
  }

  .car-info {
    grid-template-columns: 1fr;
  }

  .progress-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
