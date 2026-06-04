import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useActionStore = defineStore('action', () => {
  const filters = ref({
    name: '',
    style: '',
    beat: '',
    difficulty: null,
    bodyPart: ''
  })

  const pagination = ref({
    page: 1,
    pageSize: 12,
    total: 0
  })

  const actions = ref([])
  const loading = ref(false)

  function resetFilters() {
    filters.value = {
      name: '',
      style: '',
      beat: '',
      difficulty: null,
      bodyPart: ''
    }
    pagination.value.page = 1
  }

  function setPagination(page, pageSize) {
    pagination.value.page = page
    pagination.value.pageSize = pageSize
  }

  return {
    filters,
    pagination,
    actions,
    loading,
    resetFilters,
    setPagination
  }
})
