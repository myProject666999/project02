<template>
  <div class="part-table">
    <div v-loading="loading" class="table-wrapper">
      <div class="table-header">
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-label">零件总数</span>
            <span class="stat-value">{{ parts.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">采购总额</span>
            <span class="stat-value stat-highlight">¥{{ formatPrice(totalCost) }}</span>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加零件
        </el-button>
      </div>

      <el-table
        :data="parts"
        stripe
        style="width: 100%"
        :empty-text="'暂无零件数据'"
      >
        <el-table-column prop="name" label="零件名称" min-width="150">
          <template #default="{ row }">
            <div class="part-name">
              <span>{{ row.name }}</span>
              <el-tag v-if="row.is_original" type="warning" size="small" effect="light">
                原厂件
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="part_number" label="零件号" min-width="120" />
        <el-table-column prop="source" label="采购渠道" min-width="120" />
        <el-table-column label="单价" min-width="100">
          <template #default="{ row }">
            <span class="price">¥{{ formatPrice(row.unit_price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column label="小计" min-width="100">
          <template #default="{ row }">
            <span class="price total">¥{{ calcSubtotal(row.unit_price, row.quantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
              effect="light"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.order_date) }}
          </template>
        </el-table-column>
        <el-table-column label="到货日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.arrival_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleStatusChange(row)"
            >
              <el-icon><RefreshRight /></el-icon>
              状态
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑零件' : '添加零件'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="零件名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入零件名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="零件号" prop="part_number">
              <el-input v-model="formData.part_number" placeholder="请输入零件号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购渠道" prop="source">
              <el-input v-model="formData.source" placeholder="请输入采购渠道" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option label="待采购" value="pending" />
                <el-option label="已下单" value="ordered" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已到货" value="delivered" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="单价" prop="unit_price">
              <el-input-number
                v-model="formData.unit_price"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="单价"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number
                v-model="formData.quantity"
                :min="1"
                style="width: 100%"
                placeholder="数量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原厂件" prop="is_original">
              <el-switch v-model="formData.is_original" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下单日期" prop="order_date">
              <el-date-picker
                v-model="formData.order_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到货日期" prop="arrival_date">
              <el-date-picker
                v-model="formData.arrival_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="statusDialogVisible"
      title="更新零件状态"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="当前零件">
          <span class="current-part-name">{{ currentPart?.name }}</span>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option label="待采购" value="pending" />
            <el-option label="已下单" value="ordered" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已到货" value="delivered" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { usePartStore } from '@/stores'
import { PartStatusText, type Part } from '@/types'

const props = defineProps<{
  parts: Part[]
  carId: number
  loading?: boolean
}>()

const emit = defineEmits<{
  add: [data: any]
  edit: [id: number, data: any]
  delete: [id: number]
  statusChange: [id: number, status: string]
}>()

const partStore = usePartStore()

const dialogVisible = ref(false)
const statusDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const currentPart = ref<Part | null>(null)

const totalCost = computed(() => {
  return props.parts.reduce((sum, part) => {
    const price = Number(part.unit_price) || 0
    const quantity = Number(part.quantity) || 0
    return sum + price * quantity
  }, 0)
})

const formData = reactive({
  name: '',
  part_number: '',
  source: '',
  unit_price: 0,
  quantity: 1,
  is_original: false,
  order_date: '',
  arrival_date: '',
  status: 'pending',
  notes: ''
})

const statusForm = reactive({
  status: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入零件名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function getStatusTagType(status: string) {
  switch (status) {
    case 'delivered': return 'success'
    case 'shipped': return 'warning'
    case 'ordered': return 'info'
    default: return 'info'
  }
}

function getStatusText(status: string) {
  return PartStatusText[status as keyof typeof PartStatusText] || status
}

function formatDate(date: Date | null | string): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

function formatPrice(value: any): string {
  const num = Number(value) || 0
  return num.toFixed(2)
}

function calcSubtotal(unitPrice: any, quantity: any): string {
  const price = Number(unitPrice) || 0
  const qty = Number(quantity) || 0
  return (price * qty).toFixed(2)
}

function resetForm() {
  formData.name = ''
  formData.part_number = ''
  formData.source = ''
  formData.unit_price = 0
  formData.quantity = 1
  formData.is_original = false
  formData.order_date = ''
  formData.arrival_date = ''
  formData.status = 'pending'
  formData.notes = ''
}

function handleAdd() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Part) {
  isEdit.value = true
  currentPart.value = row
  formData.name = row.name
  formData.part_number = row.part_number || ''
  formData.source = row.source || ''
  formData.unit_price = Number(row.unit_price) || 0
  formData.quantity = Number(row.quantity) || 1
  formData.is_original = row.is_original
  formData.order_date = row.order_date ? new Date(row.order_date).toISOString().split('T')[0] : ''
  formData.arrival_date = row.arrival_date ? new Date(row.arrival_date).toISOString().split('T')[0] : ''
  formData.status = row.status
  formData.notes = row.notes || ''
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...formData,
        car_id: props.carId
      }
      if (isEdit.value && currentPart.value) {
        emit('edit', currentPart.value.id, submitData)
      } else {
        emit('add', submitData)
      }
      dialogVisible.value = false
    }
  })
}

async function handleDelete(row: Part) {
  try {
    await ElMessageBox.confirm(
      `确定要删除零件"${row.name}"吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    emit('delete', row.id)
  } catch {
  }
}

function handleStatusChange(row: Part) {
  currentPart.value = row
  statusForm.status = row.status
  statusDialogVisible.value = true
}

function handleStatusSubmit() {
  if (currentPart.value) {
    emit('statusChange', currentPart.value.id, statusForm.status)
    statusDialogVisible.value = false
  }
}
</script>

<style scoped>
.part-table {
  width: 100%;
}

.table-wrapper {
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: var(--retro-text-secondary);
  font-size: 0.85rem;
}

.stat-value {
  color: var(--retro-text-primary);
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-highlight {
  color: var(--retro-gold);
}

.part-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  color: var(--retro-text-primary);
  font-family: 'Courier New', monospace;
}

.price.total {
  color: var(--retro-gold);
  font-weight: bold;
}

.current-part-name {
  color: var(--retro-gold);
  font-weight: bold;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}
</style>
