import request from './request'

export function getActions(params) {
  return request.get('/api/actions', { params })
}

export function getAction(id) {
  return request.get(`/api/actions/${id}`)
}

export function createAction(data) {
  return request.post('/api/actions', data)
}

export function uploadVideo(formData) {
  return request.post('/api/actions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function updateAction(id, data) {
  return request.put(`/api/actions/${id}`, data)
}

export function deleteAction(id) {
  return request.delete(`/api/actions/${id}`)
}
