import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const channel = await client.channels.fetch(params.channelId)
    if (!channel || !channel.isTextBased()) {
      return NextResponse.json({ error: 'Kanal bulunamadı' }, { status: 404 })
    }

    const messages = await channel.messages.fetch({ limit: 50 })

    const messageList = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        avatar: msg.author.displayAvatarURL()
      },
      timestamp: msg.createdTimestamp,
      reactions: msg.reactions.cache.map(reaction => ({
        emoji: reaction.emoji.name || reaction.emoji.toString(),
        count: reaction.count,
        me: reaction.me
      }))
    }))

    return NextResponse.json(messageList.reverse())
  } catch (error: any) {
    console.error('Messages GET hatası:', error)
    
    if (error.code === 50001) {
      return NextResponse.json({ error: 'Bot bu kanala erişim yetkisine sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Mesaj içeriği gerekli' }, { status: 400 })
    }

    const channel = await client.channels.fetch(params.channelId)
    if (!channel || !channel.isTextBased()) {
      return NextResponse.json({ error: 'Kanal bulunamadı' }, { status: 404 })
    }

    const message = await channel.send(content)

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.createdTimestamp
      }
    })
  } catch (error: any) {
    console.error('Messages POST hatası:', error)
    
    if (error.code === 50001) {
      return NextResponse.json({ error: 'Bot bu kanala mesaj gönderme yetkisine sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 })
  }
}
