import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { guildId: string; memberId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const { nickname } = await request.json()

    const guild = client.guilds.cache.get(params.guildId)
    if (!guild) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 })
    }

    const member = await guild.members.fetch(params.memberId)
    if (!member) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
    }

    await member.setNickname(nickname || null)

    return NextResponse.json({ message: 'İsim değiştirildi' })
  } catch (error: any) {
    if (error.code === 50013) {
      return NextResponse.json({ error: 'Bot bu işlem için yeterli yetkiye sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message || 'İsim değiştirilemedi' }, { status: 500 })
  }
}
