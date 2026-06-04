import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { carsApi } from '@/api'
import type { Car } from '@/types'

export const useCarStore = defineStore('car', () => {
  const cars = ref<Car[]>([])
  const currentCar = ref<Car | null>(null)
  const loading = ref(false)

  const carsWithProgress = computed(() => {
    return cars.value.map(car => {
      let progress = 0
      if (car.processes && car.processes.length > 0) {
        const completed = car.processes.filter(p => p.status === 'completed').length
        progress = Math.round((completed / car.processes.length) * 100)
      }
      return { ...car, progress }
    })
  })

  async function fetchCars() {
    loading.value = true
    try {
      cars.value = await carsApi.findAll()
    } finally {
      loading.value = false
    }
  }

  async function fetchCarWithDetails(id: number) {
    loading.value = true
    try {
      currentCar.value = await carsApi.findOneWithDetails(id)
    } finally {
      loading.value = false
    }
  }

  async function fetchCar(id: number) {
    loading.value = true
    try {
      currentCar.value = await carsApi.findOne(id)
    } finally {
      loading.value = false
    }
  }

  async function createCar(data: any) {
    const newCar = await carsApi.create(data)
    cars.value.push(newCar)
    return newCar
  }

  async function updateCar(id: number, data: any) {
    const updatedCar = await carsApi.update(id, data)
    const index = cars.value.findIndex(c => c.id === id)
    if (index !== -1) {
      cars.value[index] = updatedCar
    }
    if (currentCar.value?.id === id) {
      currentCar.value = updatedCar
    }
    return updatedCar
  }

  async function deleteCar(id: number) {
    await carsApi.remove(id)
    cars.value = cars.value.filter(c => c.id !== id)
    if (currentCar.value?.id === id) {
      currentCar.value = null
    }
  }

  function setCurrentCar(car: Car | null) {
    currentCar.value = car
  }

  return {
    cars,
    currentCar,
    loading,
    carsWithProgress,
    fetchCars,
    fetchCar,
    fetchCarWithDetails,
    createCar,
    updateCar,
    deleteCar,
    setCurrentCar
  }
})
