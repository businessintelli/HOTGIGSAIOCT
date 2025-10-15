import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, getUser, removeAuthToken } from '../lib/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = getUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const socialLogin = async (provider, token) => {
    try {
      const response = await authAPI.socialLogin(provider, token)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    socialLogin,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

