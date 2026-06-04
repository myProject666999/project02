import { request } from './request'
import type { Car } from '@/types'

export interface CreateCarDto {
  vin: string
  brand: string
  model: string
  year: number
  name: string
  restoration_route: string
  original_photos?: string[]
  description?: string
}

export interface UpdateCarDto extends Partial<CreateCarDto> {}

export const carsApi = {
  findAll(): Promise<Car[]> {
    return request.get<Car[]>('/cars')
  },

  findOne(id: number): Promise<Car> {
    return request.get<Car>(`/cars/${id}`)
  },

  findOneWithDetails(id: number): Promise<Car> {
    return request.get<Car>(`/cars/${id}/details`)
  },

  create(data: CreateCarDto): Promise<Car> {
    return request.post<Car>('/cars', data)
  },

  update(id: number, data: UpdateCarDto): Promise<Car> {
    return request.put<Car>(`/cars/${id}`, data)
  },

  remove(id: number): Promise<void> {
    return request.delete<void>(`/cars/${id}`)
  }
}

export default carsApi
