import { useEffect, useState } from 'react'
import { Card, List, Tag, Button, Space, message, Empty } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { registrationApi } from '../services/api'
import type { Registration } from '../types'

const regStatusMap: Record<string, { text: string; color: string; icon: any }> = {
  pending: { text: '审核中', color: 'orange', icon: ClockCircleOutlined },
  approved: { text: '已通过', color: 'green', icon: CheckCircleOutlined },
  rejected: { text: '已拒绝', color: 'red', icon: CloseCircleOutlined }
}

const MyRegistrations = () => {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await registrationApi.myRegistrations()
      if (res.code === 0) {
        setRegistrations(res.data!)
      }
    } catch (e) {
      message.error('获取报名记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      <Card loading={loading} title="我的报名">
        {registrations.length === 0 ? (
          <Empty description="暂无报名记录" />
        ) : (
          <List
            dataSource={registrations}
            renderItem={(reg) => {
              const status = regStatusMap[reg.status]
              const StatusIcon = status.icon
              return (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/events/${reg.event_id}`)}>
                      查看详情
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {reg.event?.title}
                        </span>
                        <Tag color={status.color}>
                          <StatusIcon /> {status.text}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          {' '}{reg.event?.start_point} → {reg.event?.end_point}
                        </div>
                        <div>
                          <CalendarOutlined style={{ color: '#722ed1' }} />
                          {' '}集合时间：{dayjs(reg.event?.meet_time).format('YYYY-MM-DD HH:mm')}
                        </div>
                        {reg.review_note && (
                          <div style={{ color: '#fa8c16' }}>
                            审核备注：{reg.review_note}
                          </div>
                        )}
                        <div style={{ color: '#888', fontSize: '12px' }}>
                          报名时间：{dayjs(reg.created_at).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default MyRegistrations
