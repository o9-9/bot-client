'use client'

import styles from './ChannelsPanel.module.css'

interface ChannelsPanelProps {
  guild: any
  channels: any[]
  currentChannel: any
  onSelectChannel: (channel: any) => void
}

export default function ChannelsPanel({ guild, channels, currentChannel, onSelectChannel }: ChannelsPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{guild?.name || 'Sunucu Seç'}</h3>
      </div>
      <div className={styles.channelsList}>
        {channels.length > 0 && (
          <>
            <div className={styles.category}>
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
              </svg>
              <span>METIN KANALLARI</span>
            </div>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`${styles.channelItem} ${currentChannel?.id === channel.id ? styles.active : ''}`}
                onClick={() => onSelectChannel(channel)}
              >
                {channel.name}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
