import { request } from './request'
import type { Process } from '@/types'

export interface CreateProcessDto {
  car_id: number
  name: string
  process_order: number
  description?: string
}

export interface UpdateProcessDto {
  name?: string
  process_order?: number
  status?: string
  start_date?: string | null
  end_date?: string | null
  description?: string
}

export const processesApi = {
  findByCarId(carId: number): Promise<Process[]> {
    return request.get<Process[]>(`/processes/car/${carId}`)
  },

  findOne(id: number): Promise<Process> {
    return request.get<Process>(`/processes/${id}`)
  },

  create(data: CreateProcessDto): Promise<Process> {
    return request.post<Process>('/processes', data)
  },

  update(id: number, data: UpdateProcessDto): Promise<Process> {
    return request.patch<Process>(`/processes/${id}`, data)
  },

  remove(id: number): Promise<void> {
    return request.delete<void>(`/processes/${id}`)
  }
}

export default processesApi
