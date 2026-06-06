import { request } from './request'
import type { Part } from '@/types'

export interface CreatePartDto {
  car_id: number
  name: string
  part_number?: string
  source?: string
  unit_price?: number
  quantity?: number
  is_original?: boolean
  order_date?: string | null
  arrival_date?: string | null
  status?: string
  notes?: string
}

export interface UpdatePartDto extends Partial<CreatePartDto> {}

export const partsApi = {
  findByCarId(carId: number): Promise<Part[]> {
    return request.get<Part[]>(`/parts/car/${carId}`)
  },

  findOne(id: number): Promise<Part> {
    return request.get<Part>(`/parts/${id}`)
  },

  create(data: CreatePartDto): Promise<Part> {
    return request.post<Part>('/parts', data)
  },

  update(id: number, data: UpdatePartDto): Promise<Part> {
    return request.patch<Part>(`/parts/${id}`, data)
  },

  remove(id: number): Promise<void> {
    return request.delete<void>(`/parts/${id}`)
  }
}

export default partsApi
