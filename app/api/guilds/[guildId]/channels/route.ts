import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const guild = client.guilds.cache.get(params.guildId)
    if (!guild) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 })
    }

    const channels = guild.channels.cache
      .filter(channel => channel.isTextBased())
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type
      }))

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Channels hatası:', error)
    return NextResponse.json({ error: 'Kanallar alınamadı' }, { status: 500 })
  }
}
