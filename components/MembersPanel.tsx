'use client'

import { useState } from 'react'
import styles from './MembersPanel.module.css'

interface MembersPanelProps {
  members: any[]
  guildId?: string
}

export default function MembersPanel({ members, guildId }: MembersPanelProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const totalMembers = members.reduce((sum, role) => sum + role.members.length, 0)

  const handleMemberClick = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ x: rect.left - 200, y: rect.top })
    setMenuOpen(memberId)
  }

  const handleAction = async (action: string, memberId: string, member?: any) => {
    setMenuOpen(null)
    
    if (!guildId) return

    if (action === 'dm') {
      const message = prompt('DM mesajı:')
      if (!message) return

      try {
        const response = await fetch(`/api/members/${memberId}/dm`, {
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
      const nickname = prompt('Yeni isim:', member?.displayName)
      if (nickname === null) return

      try {
        const response = await fetch(`/api/guilds/${guildId}/members/${memberId}/nickname`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname })
        })
        
        const data = await response.json()
        
        if (response.ok) {
          alert('İsim değiştirildi')
          window.location.reload()
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
        const response = await fetch(`/api/guilds/${guildId}/members/${memberId}/role`, {
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
      const response = await fetch(`/api/guilds/${guildId}/members/${memberId}/${action}`, {
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
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          Üyeler — {totalMembers}
        </div>
        <div className={styles.membersList}>
          {members.map((role) => (
            role.members.length > 0 && (
              <div key={role.name} className={styles.roleGroup}>
                <div className={styles.roleTitle}>
                  <span style={{ color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#8e9297' }}>
                    {role.name}
                  </span>
                  <span className={styles.roleCount}>— {role.members.length}</span>
                </div>
                {role.members
                  .sort((a: any, b: any) => {
                    const statusOrder: any = { online: 0, idle: 1, dnd: 2, offline: 3 }
                    return statusOrder[a.status] - statusOrder[b.status]
                  })
                  .map((member: any) => (
                    <div 
                      key={member.id} 
                      className={styles.memberItem}
                      onClick={(e) => handleMemberClick(e, member.id)}
                    >
                      <div className={styles.memberAvatar}>
                        <img src={member.avatar} alt={member.username} />
                        <div className={`${styles.memberStatus} ${styles[member.status || 'offline']}`}></div>
                      </div>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{member.displayName}</div>
                        {member.activity && (
                          <div className={styles.memberActivity}>{member.activity}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )
          ))}
        </div>
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
            className={styles.memberMenu}
            style={{ 
              left: menuPosition.x, 
              top: menuPosition.y 
            }}
          >
            <div className={styles.menuItem} onClick={() => {
              const member = members.flatMap(r => r.members).find((m: any) => m.id === menuOpen)
              handleAction('dm', menuOpen, member)
            }}>
              💬 DM Gönder
            </div>
            <div className={styles.menuItem} onClick={() => {
              const member = members.flatMap(r => r.members).find((m: any) => m.id === menuOpen)
              handleAction('nickname', menuOpen, member)
            }}>
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
    </>
  )
}
