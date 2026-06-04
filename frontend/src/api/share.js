import request from './request'

export function createShare(choreographyId) {
  return request.post(`/api/share/${choreographyId}`)
}

export function getSharedChoreography(code) {
  return request.get(`/api/share/${code}`)
}

export function deactivateShare(id) {
  return request.delete(`/api/share/${id}`)
}

export function getShares() {
  return request.get('/api/share')
}
