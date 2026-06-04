import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { partsApi } from '@/api'
import type { Part } from '@/types'

export const usePartStore = defineStore('part', () => {
  const parts = ref<Part[]>([])
  const loading = ref(false)

  const totalCost = computed(() => {
    return parts.value.reduce((sum, part) => {
      const price = part.unit_price || 0
      const quantity = part.quantity || 0
      return sum + price * quantity
    }, 0)
  })

  const partsByStatus = computed(() => {
    const statuses = ['pending', 'ordered', 'shipped', 'delivered']
    return statuses.map(status => ({
      status,
      count: parts.value.filter(p => p.status === status).length
    }))
  })

  async function fetchPartsByCarId(carId: number) {
    loading.value = true
    try {
      parts.value = await partsApi.findByCarId(carId)
    } finally {
      loading.value = false
    }
  }

  async function createPart(data: any) {
    const newPart = await partsApi.create(data)
    parts.value.push(newPart)
    return newPart
  }

  async function updatePart(id: number, data: any) {
    const updatedPart = await partsApi.update(id, data)
    const index = parts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      parts.value[index] = updatedPart
    }
    return updatedPart
  }

  async function updatePartStatus(id: number, status: string) {
    const updatedPart = await partsApi.updateStatus(id, status)
    const index = parts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      parts.value[index] = updatedPart
    }
    return updatedPart
  }

  async function deletePart(id: number) {
    await partsApi.remove(id)
    parts.value = parts.value.filter(p => p.id !== id)
  }

  return {
    parts,
    loading,
    totalCost,
    partsByStatus,
    fetchPartsByCarId,
    createPart,
    updatePart,
    updatePartStatus,
    deletePart
  }
})
