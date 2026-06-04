import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Avatar, Descriptions, Tag, Progress, Select, InputNumber, Space } from 'antd'
import { UserOutlined, CarOutlined, TrophyOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { userApi } from '../services/api'
import { useUserStore } from '../store/userStore'

const { Option } = Select

const levelInfo: Record<string, { text: string; color: string; progress: number }> = {
  C: { text: '新手 (C组)', color: 'green', progress: 33 },
  B: { text: '熟练 (B组)', color: 'orange', progress: 66 },
  A: { text: '资深 (A组)', color: 'red', progress: 100 }
}

const Profile = () => {
  const { user, setUser } = useUserStore()
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user)
    }
  }, [user, form])

  const refreshProfile = async () => {
    try {
      const res = await userApi.getProfile()
      if (res.code === 0) {
        setUser(res.data!)
      }
    } catch (e) {
      message.error('获取用户信息失败')
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const res = await userApi.updateProfile(values)
      if (res.code === 0) {
        setUser(res.data!)
        message.success('更新成功')
        setEditing(false)
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <Card loading />
  }

  const level = levelInfo[user.proficiency_level] || levelInfo.C

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <Avatar size={80} icon={<UserOutlined />} src={user.avatar} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, marginBottom: '8px' }}>
              {user.nickname || user.username}
              <Tag color={level.color} style={{ marginLeft: '12px' }}>
                <TrophyOutlined /> {level.text}
              </Tag>
            </h2>
            <p style={{ color: '#888', margin: 0 }}>@{user.username} · {user.phone}</p>
          </div>
          <Button type="primary" onClick={() => setEditing(!editing)}>
            {editing ? '取消编辑' : '编辑资料'}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <Card size="small">
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {user.total_rides}
            </div>
            <div style={{ color: '#888' }}><CarOutlined /> 骑行次数</div>
          </Card>
          <Card size="small">
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {user.total_distance.toFixed(0)} km
            </div>
            <div style={{ color: '#888' }}><EnvironmentOutlined /> 总里程</div>
          </Card>
          <Card size="small">
            <Progress percent={level.progress} strokeColor={level.color} size="small" />
            <div style={{ color: '#888', marginTop: '4px' }}><TrophyOutlined /> 熟练度</div>
          </Card>
        </div>

        {editing ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item label="昵称" name="nickname">
                <Input />
              </Form.Item>

              <Form.Item label="头像URL" name="avatar">
                <Input />
              </Form.Item>

              <Form.Item label="摩托品牌" name="motorcycle_brand">
                <Input placeholder="如：本田、雅马哈" />
              </Form.Item>

              <Form.Item label="摩托型号" name="motorcycle_model">
                <Input placeholder="如：CB400X" />
              </Form.Item>

              <Form.Item label="排量(cc)" name="displacement">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="驾照等级" name="license_level">
                <Select>
                  <Option value="D">D证（三轮）</Option>
                  <Option value="E">E证（二轮）</Option>
                  <Option value="F">F证（轻便）</Option>
                </Select>
              </Form.Item>

              <Form.Item label="驾照编号" name="license_number">
                <Input />
              </Form.Item>
            </div>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
                <Button onClick={() => setEditing(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="摩托品牌">
              {user.motorcycle_brand || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="摩托型号">
              {user.motorcycle_model || '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="排量">
              {user.displacement ? `${user.displacement} cc` : '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="驾照等级">
              {user.license_level ? `${user.license_level}证` : '未填写'}
            </Descriptions.Item>
            <Descriptions.Item label="驾照编号" span={2}>
              {user.license_number || '未填写'}
            </Descriptions.Item>
          </Descriptions>
        )}

        <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, marginBottom: '8px' }}><TrophyOutlined /> 熟练度升级规则</h4>
          <p style={{ margin: '4px 0' }}>• <b>C组（新手）</b>：初始等级</p>
          <p style={{ margin: '4px 0' }}>• <b>B组（熟练）</b>：骑行次数 ≥10次 且 总里程 ≥500km</p>
          <p style={{ margin: '4px 0' }}>• <b>A组（资深）</b>：骑行次数 ≥20次 且 总里程 ≥2000km</p>
          <p style={{ margin: '4px 0', color: '#888', fontSize: '12px' }}>* 熟练度会在您每次提交骑行回顾后自动更新</p>
        </div>
      </Card>
    </div>
  )
}

export default Profile
