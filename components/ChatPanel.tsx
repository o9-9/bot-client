'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './ChatPanel.module.css'

interface ChatPanelProps {
  channel: any
  guildId?: string
  isDM?: boolean
}

export default function ChatPanel({ channel, guildId, isDM }: ChatPanelProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    if (channel) {
      loadMessages()
      connectWebSocket()
    } else {
      setMessages([])
      disconnectWebSocket()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [channel])

  const connectWebSocket = () => {
    disconnectWebSocket()

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`)
      
      ws.onopen = () => {
        if (channel) {
          ws.send(JSON.stringify({ type: 'subscribe', channelId: channel.id }))
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'message' && data.channelId === channel?.id) {
            setMessages(prev => [...prev, data.message])
            setTimeout(scrollToBottom, 100)
          }
        } catch (error) {
          console.error('WebSocket error:', error)
        }
      }

      ws.onerror = () => {}
      ws.onclose = () => {}
      
      wsRef.current = ws
    } catch (error) {}
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const loadMessages = async () => {
    setMessages([])
    try {
      const response = await fetch(`/api/channels/${channel.id}/messages`)
      const data = await response.json()
      
      if (!response.ok) return
      
      if (Array.isArray(data)) {
        setMessages(data)
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {}
  }

  const sendMessage = async () => {
    if (!channel || !inputValue.trim()) return

    const content = inputValue
    setInputValue('')

    try {
      const response = await fetch(`/api/channels/${channel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        setInputValue(content)
        const data = await response.json()
        alert(data.error || 'Mesaj gönderilemedi')
      }
    } catch (error) {
      setInputValue(content)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!channel) return

    try {
      await fetch(`/api/channels/${channel.id}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      })
      
      loadMessages()
    } catch (error) {}
  }

  const handleUserClick = (e: React.MouseEvent, user: any) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ x: rect.left, y: rect.bottom + 5 })
    setSelectedUser(user)
    setMenuOpen(user.id)
  }

  const handleAction = async (action: string, userId: string) => {
    setMenuOpen(null)
    
    if (!guildId) return

    if (action === 'dm') {
      const message = prompt('DM mesajı:')
      if (!message) return

      try {
        const response = await fetch(`/api/members/${userId}/dm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          alert('DM gönderildi')
        } else {
          alert(data.error || 'DM gönderilemedi')
        }
      } catch (error) {
        alert('Bir hata oluştu')
      }
      return
    }

    if (action === 'nickname') {
      const nickname = prompt('Yeni isim:', selectedUser?.username)
      if (nickname === null) return

      try {
        const response = await fetch(`/api/guilds/${guildId}/members/${userId}/nickname`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          alert('İsim değiştirildi')
          loadMessages()
        } else {
          alert(data.error || 'İsim değiştirilemedi')
        }
      } catch (error) {
        alert('Bir hata oluştu')
      }
      return
    }

    if (action === 'role') {
      const roleId = prompt('Rol ID:')
      if (!roleId) return

      try {
        const response = await fetch(`/api/guilds/${guildId}/members/${userId}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          alert('Rol verildi')
        } else {
          alert(data.error || 'Rol verilemedi')
        }
      } catch (error) {
        alert('Bir hata oluştu')
      }
      return
    }

    try {
      const response = await fetch(`/api/guilds/${guildId}/members/${userId}/${action}`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message || 'İşlem başarılı')
      } else {
        alert(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          {!channel ? 'Kanal Seç' : isDM ? `@${channel.name}` : `#${channel.name}`}
        </h3>
      </div>
      <div className={styles.messages}>
        {!channel ? (
          <div className={styles.welcomeMessage}>Bir sunucu ve kanal seç</div>
        ) : messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>#</div>
            <h2>{channel.name} kanalına hoş geldin!</h2>
            <p>Bu kanalın başlangıcı.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <img
                className={styles.messageAvatar}
                src={msg.author.avatar}
                alt={msg.author.username}
              />
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span 
                    className={styles.messageAuthor}
                    onClick={(e) => handleUserClick(e, msg.author)}
                  >
                    {msg.author.username}
                  </span>
                  <span className={styles.messageTimestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className={styles.messageText}>{msg.content}</div>
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={styles.reactions}>
                    {msg.reactions.map((reaction: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`${styles.reaction} ${reaction.me ? styles.reacted : ''}`}
                        onClick={() => handleReaction(msg.id, reaction.emoji)}
                      >
                        <span>{reaction.emoji}</span>
                        <span className={styles.reactionCount}>{reaction.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.messageActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleReaction(msg.id, '👍')}
                  title="Tepki ekle"
                >
                  👍
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleReaction(msg.id, '❤️')}
                  title="Tepki ekle"
                >
                  ❤️
                </button>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleReaction(msg.id, '😂')}
                  title="Tepki ekle"
                >
                  😂
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {menuOpen && (
        <>
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 999 
            }} 
            onClick={() => setMenuOpen(null)}
          />
          <div 
            className={styles.userMenu}
            style={{ 
              left: menuPosition.x, 
              top: menuPosition.y 
            }}
          >
            <div className={styles.menuItem} onClick={() => handleAction('dm', menuOpen)}>
              💬 DM Gönder
            </div>
            <div className={styles.menuItem} onClick={() => handleAction('nickname', menuOpen)}>
              ✏️ İsim Değiştir
            </div>
            <div className={styles.menuItem} onClick={() => handleAction('role', menuOpen)}>
              🎭 Rol Ver
            </div>
            <div className={styles.menuSeparator}></div>
            <div className={styles.menuItem} onClick={() => handleAction('timeout', menuOpen)}>
              ⏱️ Timeout (10dk)
            </div>
            <div className={styles.menuItem} onClick={() => handleAction('kick', menuOpen)}>
              👢 Sunucudan At
            </div>
            <div className={`${styles.menuItem} ${styles.danger}`} onClick={() => handleAction('ban', menuOpen)}>
              🔨 Banla
            </div>
          </div>
        </>
      )}

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={channel ? `#${channel.name} kanalına mesaj gönder` : 'Mesaj gönder'}
          disabled={!channel}
        />
      </div>
    </div>
  )
}
