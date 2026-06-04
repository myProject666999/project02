import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Form, Input, Button, DatePicker, InputNumber, Select, message, Upload, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { eventApi } from '../services/api'
import type { UploadFile } from 'antd/es/upload/interface'

const { Option } = Select
const { TextArea } = Input

const CreateEvent = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [gpxFile, setGpxFile] = useState<UploadFile | null>(null)

  useEffect(() => {
    if (editId) {
      fetchEvent(parseInt(editId))
    }
  }, [editId])

  const fetchEvent = async (id: number) => {
    try {
      const res = await eventApi.getEvent(id)
      if (res.code === 0) {
        const event = res.data!.event
        form.setFieldsValue({
          ...event,
          meet_time: dayjs(event.meet_time)
        })
      }
    } catch (e) {
      message.error('获取活动信息失败')
    }
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const data = {
        ...values,
        meet_time: values.meet_time.format('YYYY-MM-DDTHH:mm:ss')
      }

      let res
      if (editId) {
        res = await eventApi.updateEvent(parseInt(editId), data)
      } else {
        res = await eventApi.createEvent(data)
      }

      if (res.code === 0) {
        message.success(editId ? '活动更新成功' : '活动创建成功')

        if (gpxFile && (gpxFile as any).originFileObj) {
          await eventApi.uploadGPX(res.data!.id, (gpxFile as any).originFileObj)
          message.success('路线上传成功')
        }

        navigate(`/events/${res.data!.id}`)
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isGPX = file.name.endsWith('.gpx')
      if (!isGPX) {
        message.error('只支持GPX文件!')
        return false
      }
      setGpxFile(file as any)
      return false
    },
    onRemove: () => {
      setGpxFile(null)
    },
    fileList: gpxFile ? [gpxFile] : []
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card title={editId ? '编辑活动' : '发起新活动'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            max_participants: 20,
            checkin_radius: 200,
            min_displacement: 0
          }}
        >
          <Form.Item
            label="活动标题"
            name="title"
            rules={[{ required: true, message: '请输入活动标题' }, { max: 200, message: '最多200字符' }]}
          >
            <Input placeholder="给活动起个响亮的名字" />
          </Form.Item>

          <Form.Item label="活动描述" name="description">
            <TextArea rows={4} placeholder="介绍一下活动的目的地、风景、注意事项等" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="起点"
              name="start_point"
              rules={[{ required: true, message: '请输入起点' }]}
            >
              <Input placeholder="集合地点名称" />
            </Form.Item>

            <Form.Item
              label="终点"
              name="end_point"
              rules={[{ required: true, message: '请输入终点' }]}
            >
              <Input placeholder="目的地名称" />
            </Form.Item>

            <Form.Item label="起点纬度" name="start_lat">
              <InputNumber style={{ width: '100%' }} placeholder="可选，用于精确签到" />
            </Form.Item>

            <Form.Item label="起点经度" name="start_lng">
              <InputNumber style={{ width: '100%' }} placeholder="可选，用于精确签到" />
            </Form.Item>

            <Form.Item label="终点纬度" name="end_lat">
              <InputNumber style={{ width: '100%' }} placeholder="可选" />
            </Form.Item>

            <Form.Item label="终点经度" name="end_lng">
              <InputNumber style={{ width: '100%' }} placeholder="可选" />
            </Form.Item>

            <Form.Item
              label="集合时间"
              name="meet_time"
              rules={[{ required: true, message: '请选择集合时间' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} placeholder="选择集合时间" />
            </Form.Item>

            <Form.Item label="签到半径(米)" name="checkin_radius">
              <InputNumber style={{ width: '100%' }} min={50} max={1000} placeholder="默认200米" />
            </Form.Item>

            <Form.Item label="最低排量(cc)" name="min_displacement">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0表示不限制" />
            </Form.Item>

            <Form.Item label="驾照等级要求" name="require_license_level">
              <Select placeholder="不限制">
                <Option value="D">D证（三轮）</Option>
                <Option value="E">E证（二轮）</Option>
                <Option value="F">F证（轻便）</Option>
              </Select>
            </Form.Item>

            <Form.Item label="最大人数" name="max_participants">
              <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="默认20人" />
            </Form.Item>

            <Form.Item label="路线文件(GPX)" name="gpx">
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>选择GPX文件</Button>
              </Upload>
              <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                上传GPX路线文件，包含轨迹、海拔等信息
              </div>
            </Form.Item>
          </div>

          <Form.Item label="路线描述" name="route_description">
            <TextArea rows={3} placeholder="描述一下路线：经过哪些景点、路况如何、哪里可以休息等" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {editId ? '更新活动' : '发布活动'}
              </Button>
              <Button size="large" onClick={() => navigate('/')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CreateEvent
