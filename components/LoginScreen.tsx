'use client'

import { useState, useEffect } from 'react'
import styles from './LoginScreen.module.css'

interface LoginScreenProps {
  onLogin: (user: any, token: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orbs, setOrbs] = useState<Array<{ x: number; y: number; size: number; color: string }>>([])

  useEffect(() => {
    const newOrbs = Array.from({ length: 8 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 400 + 250,
      color: Math.random() > 0.5 ? 'rgba(88, 101, 242, 0.4)' : 'rgba(114, 137, 218, 0.35)'
    }))
    setOrbs(newOrbs)
  }, [])

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Token boş olamaz')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, token)
      } else {
        setError(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={styles.orb}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
      <div className={styles.loginBox}>
        <h1>Discord Bot Client</h1>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Bot Token'ını gir"
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  )
}
