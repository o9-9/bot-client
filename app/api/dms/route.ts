import { NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const dmChannels = client.channels.cache
      .filter(channel => channel.isDMBased())
      .map(channel => {
        const dmChannel = channel as any
        return {
          id: dmChannel.id,
          recipient: {
            id: dmChannel.recipient?.id,
            username: dmChannel.recipient?.username,
            avatar: dmChannel.recipient?.displayAvatarURL()
          },
          lastMessage: dmChannel.lastMessage ? {
            content: dmChannel.lastMessage.content,
            timestamp: dmChannel.lastMessage.createdTimestamp
          } : null
        }
      })
      .sort((a: any, b: any) => {
        if (!a.lastMessage) return 1
        if (!b.lastMessage) return -1
        return b.lastMessage.timestamp - a.lastMessage.timestamp
      })

    return NextResponse.json(dmChannels)
  } catch (error) {
    return NextResponse.json({ error: 'DM kanalları alınamadı' }, { status: 500 })
  }
}
