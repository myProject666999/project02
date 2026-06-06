import { request } from './request'
import type { SubTask } from '@/types'

export interface CreateSubTaskDto {
  process_id: number
  name: string
  description?: string
  task_order: number
}

export interface UpdateSubTaskDto {
  name?: string
  description?: string
  task_order?: number
  status?: string
}

export const subTasksApi = {
  findByProcessId(processId: number): Promise<SubTask[]> {
    return request.get<SubTask[]>(`/sub-tasks/process/${processId}`)
  },

  findOne(id: number): Promise<SubTask> {
    return request.get<SubTask>(`/sub-tasks/${id}`)
  },

  create(data: CreateSubTaskDto): Promise<SubTask> {
    return request.post<SubTask>('/sub-tasks', data)
  },

  update(id: number, data: UpdateSubTaskDto): Promise<SubTask> {
    return request.patch<SubTask>(`/sub-tasks/${id}`, data)
  },

  remove(id: number): Promise<void> {
    return request.delete<void>(`/sub-tasks/${id}`)
  }
}

export default subTasksApi
