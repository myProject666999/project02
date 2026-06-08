import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Space, Tag, message, Divider, Modal, List, Avatar, Badge } from 'antd'
import { EnvironmentOutlined, CalendarOutlined, UserOutlined, CarOutlined, CheckCircleOutlined, TeamOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { eventApi, registrationApi, checkinApi, groupApi, reviewApi } from '../services/api'
import { useUserStore } from '../store/userStore'
import type { Event, Registration, Checkin, Group, Review } from '../types'

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '报名中', color: 'blue' },
  ongoing: { text: '进行中', color: 'green' },
  completed: { text: '已结束', color: 'default' },
  cancelled: { text: '已取消', color: 'red' }
}

const regStatusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '审核中', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' }
}

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useUserStore()
  const [event, setEvent] = useState<Event | null>(null)
  const [approvedCount, setApprovedCount] = useState(0)
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null)
  const [myCheckin, setMyCheckin] = useState<Checkin | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewSummary, setReviewSummary] = useState<{ total_reviews: number; total_distance: number; max_speed: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkinModalVisible, setCheckinModalVisible] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null)

  const eventId = id ? parseInt(id) : 0

  const fetchData = async () => {
    if (!eventId) return
    setLoading(true)
    try {
      const [eventRes, regRes, checkinRes, reviewRes, groupRes] = await Promise.all([
        eventApi.getEvent(eventId),
        token ? registrationApi.myRegistrations().catch(() => ({ data: [] as any })) : { data: [] as any },
        token ? checkinApi.myCheckin(eventId).catch(() => ({ data: null as any })) : { data: null as any },
        reviewApi.eventReviews(eventId),
        groupApi.getEventGroups(eventId).catch(() => ({ data: [] as any }))
      ])

      if (eventRes.code === 0) {
        setEvent(eventRes.data!.event)
        setApprovedCount(eventRes.data!.approved_count)
      }

      if (Array.isArray(regRes.data)) {
        const myReg = regRes.data.find((r: Registration) => r.event_id === eventId)
        setMyRegistration(myReg || null)
      }

      if (checkinRes.data) {
        setMyCheckin(checkinRes.data)
      }

      if (reviewRes.code === 0) {
        setReviews(reviewRes.data!.reviews)
        setReviewSummary({
          total_reviews: reviewRes.data!.total_reviews,
          total_distance: reviewRes.data!.total_distance,
          max_speed: reviewRes.data!.max_speed
        })
      }

      if (groupRes.data) {
        setGroups(groupRes.data)
      }

      if (token && eventRes.data?.event.creator_id === user?.id) {
        const [allRegs, allCheckins] = await Promise.all([
          registrationApi.eventRegistrations(eventId),
          checkinApi.eventCheckins(eventId)
        ])
        if (allRegs.code === 0) setRegistrations(allRegs.data!)
        if (allCheckins.code === 0) setCheckins(allCheckins.data!.checkins)
      }
    } catch (e) {
      message.error('获取活动详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [eventId, token])

  const handleRegister = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const res = await registrationApi.create(eventId)
      if (res.code === 0) {
        message.success(res.message)
        fetchData()
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '报名失败')
    }
  }

  const handleCheckin = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setCheckinModalVisible(true)
        },
        () => {
          message.error('无法获取位置信息，请检查定位权限')
        }
      )
    } else {
      message.error('浏览器不支持定位功能')
    }
  }

  const confirmCheckin = async () => {
    if (!currentPosition) return
    try {
      const res = await checkinApi.create({
        event_id: eventId,
        lat: currentPosition.lat,
        lng: currentPosition.lng
      })
      if (res.code === 0) {
        message.success(res.message)
        setCheckinModalVisible(false)
        fetchData()
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '签到失败')
    }
  }

  const handleGenerateGroups = async () => {
    try {
      const res = await groupApi.generate(eventId)
      if (res.code === 0) {
        message.success('分组生成成功')
        fetchData()
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '生成分组失败')
    }
  }

  const handleReviewRegistration = async (regId: number, status: 'approved' | 'rejected', note?: string) => {
    try {
      const res = await registrationApi.review(regId, { status, note })
      if (res.code === 0) {
        message.success('审核成功')
        fetchData()
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '审核失败')
    }
  }

  const isCreator = event?.creator_id === user?.id

  if (!event) {
    return <Card loading={loading} />
  }

  return (
    <div>
      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              {event.title}
              <Tag color={statusMap[event.status].color}>
                {statusMap[event.status].text}
              </Tag>
            </h1>
            <p style={{ color: '#888', marginTop: '8px', marginBottom: 0 }}>
              发起人：{event.creator?.nickname || event.creator?.username}
            </p>
          </div>
          <Space>
            {token && event.status === 'pending' && !myRegistration && (
              <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleRegister}>
                立即报名
              </Button>
            )}
            {myRegistration && (
              <Tag color={regStatusMap[myRegistration.status].color} style={{ padding: '8px 16px', fontSize: '14px' }}>
                {regStatusMap[myRegistration.status].text}
              </Tag>
            )}
            {token && myRegistration?.status === 'approved' && event.status !== 'cancelled' && (
              <>
                {myCheckin ? (
                  <Tag color="green" style={{ padding: '8px 16px', fontSize: '14px' }}>
                    {myCheckin.is_valid ? '✓ 已签到' : '⚠ 位置异常'}
                  </Tag>
                ) : (
                  <Button type="primary" size="large" icon={<EnvironmentOutlined />} onClick={handleCheckin}>
                    GPS签到
                  </Button>
                )}
              </>
            )}
            {isCreator && (
              <>
                <Button icon={<TeamOutlined />} onClick={handleGenerateGroups}>
                  自动分组
                </Button>
                <Button onClick={() => navigate(`/create-event?id=${event.id}`)}>
                  编辑活动
                </Button>
              </>
            )}
          </Space>
        </div>

        {event.description && (
          <p style={{ fontSize: '15px', lineHeight: '1.8', marginBottom: '16px' }}>{event.description}</p>
        )}

        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="起点">
            <EnvironmentOutlined style={{ color: '#1890ff' }} /> {event.start_point}
          </Descriptions.Item>
          <Descriptions.Item label="终点">
            <EnvironmentOutlined style={{ color: '#52c41a' }} /> {event.end_point}
          </Descriptions.Item>
          <Descriptions.Item label="集合时间">
            <CalendarOutlined style={{ color: '#722ed1' }} /> {dayjs(event.meet_time).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="报名人数">
            <UserOutlined style={{ color: '#fa8c16' }} /> {approvedCount} / {event.max_participants} 人
          </Descriptions.Item>
          <Descriptions.Item label="车辆要求">
            <CarOutlined style={{ color: '#eb2f96' }} />
            {event.min_displacement > 0 ? `排量 ${event.min_displacement}cc 以上` : '无排量限制'}
            {event.require_license_level && ` · 驾照${event.require_license_level}证`}
          </Descriptions.Item>
          <Descriptions.Item label="签到范围">
            <EnvironmentOutlined style={{ color: '#13c2c2' }} /> 起点 {event.checkin_radius} 米内
          </Descriptions.Item>
          {event.route_description && (
            <Descriptions.Item label="路线说明" span={2}>
              {event.route_description}
            </Descriptions.Item>
          )}
          {event.route_gpx_path && (
            <Descriptions.Item label="路线文件" span={2}>
              <a href={event.route_gpx_path} target="_blank" rel="noopener noreferrer">
                <UploadOutlined /> 下载GPX路线文件
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {groups.length > 0 && (
        <Card title="👥 分组信息" style={{ marginTop: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {groups.map((group) => (
              <Card key={group.group_id} size="small" title={
                <Space>
                  <Tag color={group.level === 'A' ? 'red' : group.level === 'B' ? 'orange' : 'green'}>
                    {group.level}组
                  </Tag>
                  {group.group_name}
                </Space>
              }>
                {group.leader && (
                  <p style={{ marginBottom: '8px' }}>
                    <b>队长：</b>{group.leader.nickname || group.leader.username}
                    {group.leader.displacement && ` (${group.leader.displacement}cc)`}
                  </p>
                )}
                <div>
                  <b>成员 ({group.members?.length || 0}人)：</b>
                  <div style={{ marginTop: '8px' }}>
                    {(group.members || []).map((m) => (
                      <Tag key={m.id} style={{ marginBottom: '4px' }}>
                        <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '4px' }} />
                        {m.nickname || m.username}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {isCreator && registrations.length > 0 && event.status === 'pending' && (
        <Card title="📋 报名审核" style={{ marginTop: '24px' }}>
          <List
            dataSource={registrations}
            renderItem={(reg) => (
              <List.Item
                actions={reg.status === 'pending' ? [
                  <Button type="primary" size="small" onClick={() => handleReviewRegistration(reg.id, 'approved')}>
                    通过
                  </Button>,
                  <Button danger size="small" onClick={() => handleReviewRegistration(reg.id, 'rejected')}>
                    拒绝
                  </Button>
                ] : []}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{reg.user?.nickname || reg.user?.username}</span>
                      <Tag color={regStatusMap[reg.status].color}>{regStatusMap[reg.status].text}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>车辆：{reg.user?.motorcycle_brand} {reg.user?.motorcycle_model} ({reg.displacement}cc)</div>
                      <div>驾照：{reg.license_level}证</div>
                      {reg.review_note && <div style={{ color: '#fa8c16' }}>备注：{reg.review_note}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {isCreator && checkins.length > 0 && (
        <Card title="✅ 签到记录" style={{ marginTop: '24px' }}>
          <List
            dataSource={checkins}
            renderItem={(checkin) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{checkin.user?.nickname || checkin.user?.username}</span>
                      <Badge status={checkin.is_valid ? 'success' : 'warning'} text={checkin.is_valid ? '位置正常' : '位置异常'} />
                    </Space>
                  }
                  description={
                    <div>
                      <div>签到时间：{dayjs(checkin.checkin_time).format('YYYY-MM-DD HH:mm:ss')}</div>
                      <div>距离起点：{checkin.distance_from_start.toFixed(0)} 米</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {reviewSummary && reviewSummary.total_reviews > 0 && (
        <Card title={
          <Space>
            <PlayCircleOutlined />
            活动回顾 ({reviewSummary.total_reviews}份)
          </Space>
        } style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {reviewSummary.total_distance.toFixed(1)} km
              </div>
              <div style={{ color: '#888' }}>总里程</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {reviewSummary.max_speed.toFixed(0)} km/h
              </div>
              <div style={{ color: '#888' }}>最高时速</div>
            </div>
          </div>
          <List
            dataSource={reviews}
            renderItem={(review) => (
              <List.Item onClick={() => navigate(`/reviews/${review.id}`)} style={{ cursor: 'pointer' }}>
                <List.Item.Meta
                  title={`${review.user?.nickname || review.user?.username} 的回顾`}
                  description={
                    <div>
                      <div>里程：{review.total_distance?.toFixed(1)} km · 最高：{review.max_speed?.toFixed(0)} km/h</div>
                      {review.content && <div>{review.content}</div>}
                      <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                        {dayjs(review.created_at).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Modal
        title="GPS签到确认"
        open={checkinModalVisible}
        onOk={confirmCheckin}
        onCancel={() => setCheckinModalVisible(false)}
        okText="确认签到"
        cancelText="取消"
      >
        <p>您当前的位置：</p>
        {currentPosition && (
          <p>
            纬度：{currentPosition.lat.toFixed(6)}<br />
            经度：{currentPosition.lng.toFixed(6)}<br />
            签到范围：起点 {event.checkin_radius} 米内
          </p>
        )}
        <p style={{ color: '#fa8c16' }}>请确保您已到达集合点，签到后将记录您的位置信息。</p>
      </Modal>
    </div>
  )
}

export default EventDetail
