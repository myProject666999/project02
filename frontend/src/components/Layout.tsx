import { Layout, Menu, Button } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlusOutlined, UserOutlined, CalendarOutlined, CarOutlined, LogoutOutlined } from '@ant-design/icons'
import { useUserStore } from '../store/userStore'

const { Header } = Layout

const AppHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/',
      icon: <CarOutlined />,
      label: '活动列表',
      onClick: () => navigate('/')
    }
  ]

  if (token) {
    menuItems.push(
      {
        key: '/create-event',
        icon: <PlusOutlined />,
        label: '发起活动',
        onClick: () => navigate('/create-event')
      },
      {
        key: '/my-registrations',
        icon: <CalendarOutlined />,
        label: '我的报名',
        onClick: () => navigate('/my-registrations')
      },
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile')
      }
    )
  }

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px'
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginRight: '48px',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        🏍️ 摩托车队组队
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ flex: 1, minWidth: 0, background: 'transparent' }}
      />
      {token ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'white' }}>
            {user?.nickname || user?.username}
          </span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
          <Button onClick={() => navigate('/register')}>
            注册
          </Button>
        </div>
      )}
    </Header>
  )
}

export default AppHeader
