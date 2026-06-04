import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import CreateEvent from './pages/CreateEvent'
import Profile from './pages/Profile'
import MyRegistrations from './pages/MyRegistrations'
import { useUserStore } from './store/userStore'

const { Content } = Layout

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useUserStore((state) => state.token)
  return token ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/create-event"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <PrivateRoute>
                <MyRegistrations />
              </PrivateRoute>
            }
          />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App
