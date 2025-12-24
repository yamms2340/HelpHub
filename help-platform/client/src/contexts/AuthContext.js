import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const res = await authAPI.getCurrentUser()
      setUser(res.data.user)
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password })
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password })
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      getCurrentUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
