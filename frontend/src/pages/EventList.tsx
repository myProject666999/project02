import { useEffect, useState } from 'react'
import { Card, List, Tag, Button, Space, Pagination, message } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, CarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { eventApi } from '../services/api'
import type { Event } from '../types'

const statusMap: Record<string, { text: string; color: string } = {
  pending: { text: '报名中', color: 'blue' },
  ongoing: { text: '进行中', color: 'green' },
  completed: { text: '已结束', color: 'default' },
  cancelled: { text: '已取消', color: 'red' }
}

const EventList = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchEvents = async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await eventApi.listEvents({ page: pageNum, page_size: 10 })
      if (res.code === 0) {
        setEvents(res.data!.events)
        setTotal(res.data!.total)
        setPage(pageNum)
      }
    } catch (e) {
      message.error('获取活动列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h2 style={{ margin: 0 }}>🏍️ 骑行活动</h2>
      <Button type="primary" onClick={() => navigate('/create-event')}>
        发起活动
      </Button>
    </div>

    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
      dataSource={events}
      loading={loading}
      renderItem={(event) => (
        <List.Item>
          <Card
        hoverable
        onClick={() => navigate(`/events/${event.id}`)}
        style={{ height: '100%' }}
      >
        <Card.Meta
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.title}</span>
              <Tag color={statusMap[event.status].color}>
                {statusMap[event.status].text}
              </Tag>
            </div>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span>起点：{event.start_point}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <EnvironmentOutlined style={{ color: '#52c41a' }} />
                <span>终点：{event.end_point}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarOutlined style={{ color: '#722ed1' }} />
                <span>集合：{dayjs(event.meet_time).format('YYYY-MM-DD HH:mm')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserOutlined style={{ color: '#fa8c16' }} />
                <span>发起人：{event.creator?.nickname || event.creator?.username}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CarOutlined style={{ color: '#eb2f96' }} />
                <span>
                  {event.min_displacement > 0 ? `最低${event.min_displacement}cc · ` : ''}
                  {event.max_participants}人上限
                </span>
              </div>
          </Space>
          }
        />
      </Card>
    </List.Item>
  )}
/>

{total > 10 && (
  <div style={{ marginTop: '24px', textAlign: 'center' }}>
    <Pagination
      current={page}
      total={total}
      pageSize={10}
      onChange={fetchEvents}
      showSizeChanger={false}
    />
  </div>
)}
    </div>
  )
}

export default EventList
