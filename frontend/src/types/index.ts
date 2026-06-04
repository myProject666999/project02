export interface User {
  id: number
  username: string
  phone: string
  nickname: string
  avatar: string
  motorcycle_brand: string
  motorcycle_model: string
  displacement: number
  license_level: string
  license_number: string
  proficiency_level: string
  total_rides: number
  total_distance: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  creator_id: number
  title: string
  description: string
  start_point: string
  start_lat: number
  start_lng: number
  end_point: string
  end_lat: number
  end_lng: number
  meet_time: string
  route_gpx_path: string
  route_description: string
  min_displacement: number
  require_license_level: string
  max_participants: number
  checkin_radius: number
  status: string
  created_at: string
  updated_at: string
  creator?: User
}

export interface Registration {
  id: number
  event_id: number
  user_id: number
  displacement: number
  license_level: string
  status: 'pending' | 'approved' | 'rejected'
  review_note: string
  reviewed_by?: number
  reviewed_at?: string
  created_at: string
  user?: User
  event?: Event
}

export interface Checkin {
  id: number
  event_id: number
  user_id: number
  lat: number
  lng: number
  distance_from_start: number
  is_valid: boolean
  checkin_time: string
  user?: User
}

export interface Group {
  group_id: number
  group_name: string
  level: string
  members: User[]
  leader?: User
}

export interface Review {
  id: number
  event_id: number
  user_id: number
  total_distance: number
  max_speed: number
  avg_speed: number
  ride_duration: number
  content: string
  created_at: string
  user?: User
}

export interface Media {
  id: number
  review_id: number
  event_id: number
  user_id: number
  media_type: 'image' | 'video'
  file_path: string
  file_size: number
  lat?: number
  lng?: number
  captured_at?: string
  created_at: string
}

export interface TrackPoint {
  id: number
  review_id: number
  user_id: number
  event_id: number
  lat: number
  lng: number
  elevation?: number
  speed?: number
  recorded_at: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}
