import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const { emoji } = await request.json()

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji gerekli' }, { status: 400 })
    }

    const channel = await client.channels.fetch(params.channelId)
    if (!channel || !channel.isTextBased()) {
      return NextResponse.json({ error: 'Kanal bulunamadı' }, { status: 404 })
    }

    const message = await channel.messages.fetch(params.messageId)
    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 })
    }

    await message.react(emoji)

    return NextResponse.json({ success: true, message: 'Tepki eklendi' })
  } catch (error: any) {
    console.error('Reaction error:', error)
    
    if (error.code === 50001) {
      return NextResponse.json({ error: 'Bot bu mesaja tepki ekleme yetkisine sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Tepki eklenemedi' }, { status: 500 })
  }
}
