import { defineStore } from 'pinia'
import { ref } from 'vue'
import { processesApi } from '@/api'
import type { Process, ProcessStatus } from '@/types'

export const useProcessStore = defineStore('process', () => {
  const processes = ref<Process[]>([])
  const loading = ref(false)

  async function fetchProcessesByCarId(carId: number) {
    loading.value = true
    try {
      processes.value = await processesApi.findByCarId(carId)
    } finally {
      loading.value = false
    }
  }

  async function createProcess(data: any) {
    const newProcess = await processesApi.create(data)
    processes.value.push(newProcess)
    processes.value.sort((a, b) => a.process_order - b.process_order)
    return newProcess
  }

  async function updateProcess(id: number, data: any) {
    const updatedProcess = await processesApi.update(id, data)
    const index = processes.value.findIndex(p => p.id === id)
    if (index !== -1) {
      processes.value[index] = updatedProcess
    }
    return updatedProcess
  }

  async function updateProcessStatus(id: number, status: ProcessStatus) {
    const updatedProcess = await processesApi.updateStatus(id, status)
    const index = processes.value.findIndex(p => p.id === id)
    if (index !== -1) {
      processes.value[index] = updatedProcess
    }
    return updatedProcess
  }

  async function deleteProcess(id: number) {
    await processesApi.remove(id)
    processes.value = processes.value.filter(p => p.id !== id)
  }

  async function initializeProcesses(carId: number) {
    loading.value = true
    try {
      processes.value = await processesApi.initializeProcesses(carId)
    } finally {
      loading.value = false
    }
  }

  function isProcessLocked(process: Process): boolean {
    const sortedProcesses = [...processes.value].sort((a, b) => a.process_order - b.process_order)
    const currentIndex = sortedProcesses.findIndex(p => p.id === process.id)
    if (currentIndex <= 0) return false
    const previousProcess = sortedProcesses[currentIndex - 1]
    return previousProcess.status !== 'completed'
  }

  return {
    processes,
    loading,
    fetchProcessesByCarId,
    createProcess,
    updateProcess,
    updateProcessStatus,
    deleteProcess,
    initializeProcesses,
    isProcessLocked
  }
})
