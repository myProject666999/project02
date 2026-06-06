import { request } from './request'
import type { RepairLog } from '@/types'

export interface CreateRepairLogDto {
  car_id: number
  log_date: string
  content: string
  photos?: string[]
}

export interface UpdateRepairLogDto {
  log_date?: string
  content?: string
  photos?: string[]
}

export const repairLogsApi = {
  findByCarId(carId: number): Promise<RepairLog[]> {
    return request.get<RepairLog[]>(`/repair-logs/car/${carId}`)
  },

  findOne(id: number): Promise<RepairLog> {
    return request.get<RepairLog>(`/repair-logs/${id}`)
  },

  create(data: CreateRepairLogDto): Promise<RepairLog> {
    return request.post<RepairLog>('/repair-logs', data)
  },

  update(id: number, data: UpdateRepairLogDto): Promise<RepairLog> {
    return request.patch<RepairLog>(`/repair-logs/${id}`, data)
  },

  remove(id: number): Promise<void> {
    return request.delete<void>(`/repair-logs/${id}`)
  }
}

export default repairLogsApi
