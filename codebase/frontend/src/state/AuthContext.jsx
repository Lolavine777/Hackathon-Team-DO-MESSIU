import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

const STORAGE_KEY = 'vlearn.session.user'
const idKey = (role) => `vlearn.session.id.${role}`

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* bỏ qua lỗi storage */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = read(STORAGE_KEY)
    try {
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  /** Vào lớp: backend cấp user_id để chống gửi trùng và xem lại bài của mình. */
  const login = useCallback(async (role, name) => {
    const profile = await api('/auth/login', {
      method: 'POST',
      role,
      body: { role, name: name?.trim() || undefined, user_id: read(idKey(role)) || undefined },
    })
    write(idKey(role), profile.id)
    write(STORAGE_KEY, JSON.stringify(profile))
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* bỏ qua lỗi storage */
    }
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
