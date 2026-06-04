export enum RestorationRoute {
  RESTORATION = 'restoration',
  MODIFICATION = 'modification'
}

export enum ProcessStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum PartStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export interface Car {
  id: number
  vin: string
  brand: string
  model: string
  year: number
  name: string
  restoration_route: RestorationRoute
  original_photos: string[]
  description: string
  created_at: Date
  updated_at: Date
  processes?: Process[]
  parts?: Part[]
  repairLogs?: RepairLog[]
}

export interface Process {
  id: number
  car_id: number
  name: string
  process_order: number
  status: ProcessStatus
  start_date: Date | null
  end_date: Date | null
  description: string
  subTasks?: SubTask[]
}

export interface SubTask {
  id: number
  process_id: number
  name: string
  description: string
  task_order: number
  status: ProcessStatus
}

export interface Part {
  id: number
  car_id: number
  name: string
  part_number: string
  source: string
  unit_price: number
  quantity: number
  is_original: boolean
  order_date: Date | null
  arrival_date: Date | null
  status: PartStatus
  notes: string
}

export interface RepairLog {
  id: number
  car_id: number
  log_date: Date
  content: string
  photos: string[]
}

export const ProcessStatusText: Record<ProcessStatus, string> = {
  [ProcessStatus.PENDING]: '待开始',
  [ProcessStatus.IN_PROGRESS]: '进行中',
  [ProcessStatus.COMPLETED]: '已完成'
}

export const PartStatusText: Record<PartStatus, string> = {
  [PartStatus.PENDING]: '待采购',
  [PartStatus.ORDERED]: '已下单',
  [PartStatus.SHIPPED]: '已发货',
  [PartStatus.DELIVERED]: '已到货'
}

export const RestorationRouteText: Record<RestorationRoute, string> = {
  [RestorationRoute.RESTORATION]: '修旧如旧',
  [RestorationRoute.MODIFICATION]: '改装升级'
}
