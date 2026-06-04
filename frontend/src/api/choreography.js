import request from './request'

export function getChoreographies() {
  return request.get('/api/choreographies')
}

export function getChoreography(id) {
  return request.get(`/api/choreographies/${id}`)
}

export function createChoreography(data) {
  return request.post('/api/choreographies', data)
}

export function updateChoreography(id, data) {
  return request.put(`/api/choreographies/${id}`, data)
}

export function deleteChoreography(id) {
  return request.delete(`/api/choreographies/${id}`)
}

export function addItem(choreographyId, data) {
  return request.post(`/api/choreographies/${choreographyId}/items`, data)
}

export function removeItem(choreographyId, itemId) {
  return request.delete(`/api/choreographies/${choreographyId}/items/${itemId}`)
}

export function reorderItems(choreographyId, items) {
  return request.put(`/api/choreographies/${choreographyId}/items/reorder`, items)
}
