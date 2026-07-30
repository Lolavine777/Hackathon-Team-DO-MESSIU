import { Navigate, Route, Routes } from 'react-router-dom'
import { IconContext } from './lib/icons.js'
import { AuthProvider, useAuth } from './state/AuthContext.jsx'
import { SessionProvider } from './state/SessionContext.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import ConnectionGate from './components/layout/ConnectionGate.jsx'
import LoginPage from './pages/LoginPage.jsx'
import LearnerPage from './pages/LearnerPage.jsx'
import TeacherPage from './pages/TeacherPage.jsx'

function RoleGate() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
      <Route
        path="/learner"
        element={
          user?.role === 'learner' ? (
            <ConnectionGate>
              <LearnerPage />
            </ConnectionGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/teacher"
        element={
          user?.role === 'teacher' ? (
            <ConnectionGate>
              <TeacherPage />
            </ConnectionGate>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
    </Routes>
  )
}

/** Icon mặc định: cùng cỡ chữ, nét đậm để hợp với typography extrabold của giao diện. */
const ICON_DEFAULTS = { size: 16, weight: 'bold' }

export default function App() {
  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <AuthProvider>
        <ToastProvider>
          <SessionProvider>
            <RoleGate />
          </SessionProvider>
        </ToastProvider>
      </AuthProvider>
    </IconContext.Provider>
  )
}
