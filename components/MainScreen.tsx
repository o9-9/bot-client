'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './MainScreen.module.css'
import ChannelsPanel from './ChannelsPanel'
import ChatPanel from './ChatPanel'
import MembersPanel from './MembersPanel'

interface MainScreenProps {
  user: any
  onLogout: () => void
}

export default function MainScreen({ user, onLogout }: MainScreenProps) {
  const [guilds, setGuilds] = useState<any[]>([])
  const [currentGuild, setCurrentGuild] = useState<any>(null)
  const [channels, setChannels] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [currentChannel, setCurrentChannel] = useState<any>(null)
  const [showDMs, setShowDMs] = useState(false)
  const [dmChannels, setDmChannels] = useState<any[]>([])

  useEffect(() => {
    loadGuilds()
  }, [])

  const loadGuilds = async () => {
    try {
      const response = await fetch('/api/guilds')
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setGuilds(data)
      } else {
        setGuilds([])
      }
    } catch (error) {
      setGuilds([])
    }
  }

  const handleHomeClick = async () => {
    setShowDMs(true)
    setCurrentGuild(null)
    setCurrentChannel(null)
    setChannels([])
    setMembers([])

    try {
      const response = await fetch('/api/dms')
      const data = await response.json()
      setDmChannels(Array.isArray(data) ? data : [])
    } catch (error) {}
  }

  const selectGuild = async (guild: any) => {
    setShowDMs(false)
    setCurrentGuild(guild)
    setCurrentChannel(null)
    setChannels([])
    setMembers([])

    try {
      const channelsRes = await fetch(`/api/guilds/${guild.id}/channels`)
      const channelsData = await channelsRes.json()
      setChannels(Array.isArray(channelsData) ? channelsData : [])

      fetch(`/api/guilds/${guild.id}/members`)
        .then(res => res.json())
        .then(data => setMembers(Array.isArray(data) ? data : []))
        .catch(() => {})
    } catch (error) {}
  }

  const selectDM = (dmChannel: any) => {
    setCurrentChannel({
      id: dmChannel.id,
      name: dmChannel.recipient.username,
      isDM: true
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div 
          className={`${styles.homeButton} ${showDMs ? styles.active : ''}`}
          title="Ana Sayfa - DM'ler"
          onClick={handleHomeClick}
        >
          <svg width="28" height="28" viewBox="0 0 28 20">
            <path fill="currentColor" d="M20.6644 20C20.6644 20 19.8014 18.9762 19.0822 18.0714C22.2226 17.1905 23.4212 15.2381 23.4212 15.2381C22.4384 15.881 21.5034 16.3334 20.6644 16.6429C19.4658 17.1429 18.3151 17.4762 17.1884 17.6667C14.887 18.0953 12.7774 17.9762 10.9795 17.6429C9.61301 17.381 8.43836 17 7.45548 16.6191C6.90411 16.4048 6.30479 16.1429 5.70548 15.8096C5.63356 15.7619 5.56164 15.7381 5.48973 15.6905C5.44178 15.6667 5.41781 15.6429 5.39384 15.6191C4.96233 15.381 4.7226 15.2143 4.7226 15.2143C4.7226 15.2143 5.87329 17.1191 8.91781 18.0238C8.19863 18.9286 7.31164 20 7.31164 20C2.0137 19.8333 0 16.381 0 16.381C0 8.7143 3.45205 2.52381 3.45205 2.52381C6.90411 -0.07143 10.1918 0 10.1918 0L10.4315 0.285714C6.08219 1.52381 4.0274 3.33333 4.0274 3.33333C4.0274 3.33333 4.58904 3.04762 5.56164 2.66667C8.10274 1.59524 10.1438 1.2619 10.9795 1.19048C11.1233 1.16667 11.2432 1.14286 11.387 1.14286C12.8493 0.952381 14.5034 0.904762 16.2295 1.11905C18.5068 1.38095 20.9521 2.0952 23.4452 3.33333C23.4452 3.33333 21.4863 1.61905 17.4178 0.380952L17.7335 0C17.7335 0 21.0212 -0.07143 24.4732 2.52381C24.4732 2.52381 27.9253 8.7143 27.9253 16.381C27.9253 16.381 25.8836 19.8333 20.6644 20Z"></path>
          </svg>
        </div>
        <div className={styles.guildSeparator}></div>
        <div className={styles.guildsList}>
          {guilds.map((guild) => (
            <div
              key={guild.id}
              className={`${styles.guildItem} ${currentGuild?.id === guild.id ? styles.active : ''} ${!guild.icon ? styles.noIcon : ''}`}
              title={guild.name}
              onClick={() => selectGuild(guild)}
            >
              {guild.icon ? (
                <img src={guild.icon} alt={guild.name} />
              ) : (
                guild.name.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase()
              )}
            </div>
          ))}
        </div>
        <div className={styles.userInfo}>
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
            alt={user.username}
            title={`${user.username} - Çıkış yapmak için tıkla`}
            onClick={onLogout}
          />
        </div>
      </div>

      {showDMs ? (
        <div className={styles.channelsPanel}>
          <div className={styles.panelHeader}>
            <h3>Direkt Mesajlar</h3>
          </div>
          <div className={styles.channelsList}>
            {dmChannels.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#72767d', fontSize: '14px' }}>
                Henüz DM yok
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  Bota mesaj gönderen kullanıcılar burada görünecek
                </div>
              </div>
            ) : (
              dmChannels.map((dm) => (
                <div
                  key={dm.id}
                  className={`${styles.dmItem} ${currentChannel?.id === dm.id ? styles.active : ''}`}
                  onClick={() => selectDM(dm)}
                >
                  <img 
                    src={dm.recipient.avatar} 
                    alt={dm.recipient.username}
                    className={styles.dmAvatar}
                  />
                  <div className={styles.dmInfo}>
                    <div className={styles.dmName}>{dm.recipient.username}</div>
                    {dm.lastMessage && (
                      <div className={styles.dmLastMessage}>
                        {dm.lastMessage.content.substring(0, 30)}
                        {dm.lastMessage.content.length > 30 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <ChannelsPanel
          guild={currentGuild}
          channels={channels}
          currentChannel={currentChannel}
          onSelectChannel={setCurrentChannel}
        />
      )}

      <ChatPanel channel={currentChannel} guildId={currentGuild?.id} isDM={showDMs} />

      <MembersPanel members={members} guildId={currentGuild?.id} />
    </div>
  )
}
