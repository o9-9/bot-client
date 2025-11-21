'use client'

import { useState, useEffect } from 'react'
import LoginScreen from '@/components/LoginScreen'
import MainScreen from '@/components/MainScreen'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('discord_bot_token')
    if (savedToken) {
      autoLogin(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const autoLogin = async (token: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('discord_bot_token')
      }
    } catch (error) {
      localStorage.removeItem('discord_bot_token')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any, token: string) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('discord_bot_token', token)
  }

  const handleLogout = () => {
    localStorage.removeItem('discord_bot_token')
    setUser(null)
    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <main style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#000'
      }}>
        <div style={{ color: '#fff', fontSize: '20px' }}>Yükleniyor...</div>
      </main>
    )
  }

  return (
    <main>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <MainScreen user={user} onLogout={handleLogout} />
      )}
    </main>
  )
}
