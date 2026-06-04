import { Form, Input, Button, Card, message, Select, InputNumber } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useUserStore } from '../store/userStore'

const { Option } = Select

const Register = () => {
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)

  const onFinish = async (values: any) => {
    try {
      const res = await authApi.register(values)
      if (res.code === 0) {
        setToken(res.data!.token)
        setUser(res.data!.user)
        message.success('注册成功')
        navigate('/')
      } else {
          message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '注册失败')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh', padding: '40px 0' }}>
      <Card title="注册" style={{ width: 500 }}>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '至少3个字符' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              label="昵称"
              name="nickname"
            >
              <Input placeholder="昵称" />
            </Form.Item>

            <Form.Item
              label="手机号"
              name="phone"
              rules={[{ required: true, message: '请输入手机号' }, { len: 11, message: '手机号为11位' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="手机号" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少6个字符' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item
              label="摩托品牌"
              name="motorcycle_brand"
            >
              <Input placeholder="如：本田、雅马哈" />
            </Form.Item>

            <Form.Item
              label="摩托型号"
              name="motorcycle_model"
            >
              <Input placeholder="如：CB400X" />
            </Form.Item>

            <Form.Item
              label="排量(cc)"
              name="displacement"
            >
              <InputNumber style={{ width: '100%' }} placeholder="如：400" />
            </Form.Item>

            <Form.Item
              label="驾照等级"
              name="license_level"
            >
              <Select placeholder="请选择驾照等级">
                <Option value="D">D证（三轮）</Option>
                <Option value="E">E证（二轮）</Option>
                <Option value="F">F证（轻便）</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="驾照编号"
              name="license_number"
            >
              <Input placeholder="驾照编号" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
