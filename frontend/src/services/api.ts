import axios, { AxiosInstance } from 'axios'
import type { ApiResponse, User, Event, Registration, Checkin, Group, Review, Media, TrackPoint } from '../types'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: {
    username: string
    phone: string
    password: string
    nickname?: string
    motorcycle_brand?: string
    motorcycle_model?: string
    displacement?: number
    license_level?: string
    license_number?: string
  }): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/register', data),

  login: (data: {
    username: string
    password: string
  }): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/login', data)
}

export const userApi = {
  getProfile: (): Promise<ApiResponse<User>> => api.get('/users/profile'),
  updateProfile: (data: Partial<User>): Promise<ApiResponse<User>> => api.put('/users/profile', data),
  getUser: (id: number): Promise<ApiResponse<User>> => api.get(`/users/${id}`)
}

export const eventApi = {
  listEvents: (params?: { page?: number; page_size?: number; status?: string }): Promise<ApiResponse<{
    total: number
    page: number
    page_size: number
    events: Event[]
  }>> => api.get('/events', { params }),

  getEvent: (id: number): Promise<ApiResponse<{
    event: Event
    approved_count: number
  }>> => api.get(`/events/${id}`),

  createEvent: (data: {
    title: string
    description?: string
    start_point: string
    start_lat?: number
    start_lng?: number
    end_point: string
    end_lat?: number
    end_lng?: number
    meet_time: string
    route_description?: string
    min_displacement?: number
    require_license_level?: string
    max_participants?: number
    checkin_radius?: number
  }): Promise<ApiResponse<Event>> => api.post('/events', data),

  updateEvent: (id: number, data: Partial<Event>): Promise<ApiResponse<Event>> => api.put(`/events/${id}`, data),
  deleteEvent: (id: number): Promise<ApiResponse> => api.delete(`/events/${id}`),
  uploadGPX: (id: number, file: File): Promise<ApiResponse<{
    gpx_path: string
    stats: any
  }>> => {
    const formData = new FormData()
    formData.append('gpx', file)
    return api.post(`/events/${id}/upload-gpx`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const registrationApi = {
  create: (event_id: number): Promise<ApiResponse<Registration>> => api.post('/registrations', { event_id }),
  myRegistrations: (): Promise<ApiResponse<Registration[]>> => api.get('/registrations/my'),
  eventRegistrations: (eventId: number): Promise<ApiResponse<Registration[]>> => api.get(`/registrations/event/${eventId}`),
  review: (id: number, data: { status: 'approved' | 'rejected'; note?: string }): Promise<ApiResponse<Registration>> =>
    api.put(`/registrations/${id}/review`, data)
}

export const checkinApi = {
  create: (data: { event_id: number; lat: number; lng: number }): Promise<ApiResponse<Checkin>> => api.post('/checkins', data),
  eventCheckins: (eventId: number): Promise<ApiResponse<{
    total: number
    valid_count: number
    checkins: Checkin[]
  }>> => api.get(`/checkins/event/${eventId}`),
  myCheckin: (eventId: number): Promise<ApiResponse<Checkin>> => api.get(`/checkins/event/${eventId}/my`)
}

export const groupApi = {
  generate: (eventId: number): Promise<ApiResponse> => api.post(`/groups/event/${eventId}/generate`),
  getEventGroups: (eventId: number): Promise<ApiResponse<Group[]>> => api.get(`/groups/event/${eventId}`),
  addMember: (groupId: number, user_id: number): Promise<ApiResponse> => api.post(`/groups/${groupId}/members`, { user_id }),
  removeMember: (groupId: number, userId: number): Promise<ApiResponse> => api.delete(`/groups/${groupId}/members/${userId}`)
}

export const reviewApi = {
  create: (data: {
    event_id: number
    total_distance?: number
    max_speed?: number
    avg_speed?: number
    ride_duration?: number
    content?: string
  }): Promise<ApiResponse<Review>> => api.post('/reviews', data),

  getReview: (id: number): Promise<ApiResponse<{
    review: Review
    media: Media[]
    track_points: TrackPoint[]
  }>> => api.get(`/reviews/${id}`),

  myReviews: (): Promise<ApiResponse<Review[]>> => api.get('/reviews/my'),
  eventReviews: (eventId: number): Promise<ApiResponse<{
    total_reviews: number
    total_distance: number
    max_speed: number
    reviews: Review[]
  }>> => api.get(`/reviews/event/${eventId}`),

  uploadMedia: (reviewId: number, file: File, metadata?: { lat?: number; lng?: number; captured_at?: string }): Promise<ApiResponse<Media>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata?.lat) formData.append('lat', String(metadata.lat))
    if (metadata?.lng) formData.append('lng', String(metadata.lng))
    if (metadata?.captured_at) formData.append('captured_at', metadata.captured_at)
    return api.post(`/reviews/${reviewId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  uploadTrack: (reviewId: number, file: File): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append('track', file)
    return api.post(`/reviews/${reviewId}/track`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
