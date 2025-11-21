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

    const guilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount
    }))

    return NextResponse.json(guilds)
  } catch (error) {
    console.error('Guilds hatası:', error)
    return NextResponse.json({ error: 'Sunucular alınamadı' }, { status: 500 })
  }
}
