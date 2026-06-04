import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useUserStore } from '../store/userStore'

const Login = () => {
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)
  const setToken = useUserStore((state) => state.setToken)

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await authApi.login(values)
      if (res.code === 0) {
        setToken(res.data!.token)
        setUser(res.data!.user)
        message.success('登录成功')
        navigate('/')
      } else {
        message.error(res.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || '登录失败')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Card title="登录" style={{ width: 400 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名或手机号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名或手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            还没有账号？<Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
