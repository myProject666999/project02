import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { repairLogsApi } from '@/api'
import type { RepairLog } from '@/types'

export const useRepairLogStore = defineStore('repairLog', () => {
  const repairLogs = ref<RepairLog[]>([])
  const loading = ref(false)

  const sortedLogs = computed(() => {
    return [...repairLogs.value].sort((a, b) => {
      return new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    })
  })

  async function fetchRepairLogsByCarId(carId: number) {
    loading.value = true
    try {
      repairLogs.value = await repairLogsApi.findByCarId(carId)
    } finally {
      loading.value = false
    }
  }

  async function createRepairLog(data: any) {
    const newLog = await repairLogsApi.create(data)
    repairLogs.value.push(newLog)
    return newLog
  }

  async function updateRepairLog(id: number, data: any) {
    const updatedLog = await repairLogsApi.update(id, data)
    const index = repairLogs.value.findIndex(l => l.id === id)
    if (index !== -1) {
      repairLogs.value[index] = updatedLog
    }
    return updatedLog
  }

  async function deleteRepairLog(id: number) {
    await repairLogsApi.remove(id)
    repairLogs.value = repairLogs.value.filter(l => l.id !== id)
  }

  return {
    repairLogs,
    loading,
    sortedLogs,
    fetchRepairLogsByCarId,
    createRepairLog,
    updateRepairLog,
    deleteRepairLog
  }
})
