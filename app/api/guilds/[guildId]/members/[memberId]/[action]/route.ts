import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { guildId: string; memberId: string; action: string } }
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

    const member = await guild.members.fetch(params.memberId)
    if (!member) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
    }

    switch (params.action) {
      case 'kick':
        await member.kick('Bot tarafından atıldı')
        return NextResponse.json({ message: `${member.user.username} sunucudan atıldı` })

      case 'ban':
        await member.ban({ reason: 'Bot tarafından banlandı' })
        return NextResponse.json({ message: `${member.user.username} banlandı` })

      case 'timeout':
        await member.timeout(10 * 60 * 1000, 'Bot tarafından timeout verildi') // 10 dakika
        return NextResponse.json({ message: `${member.user.username} 10 dakika timeout aldı` })

      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Member action error:', error)
    
    if (error.code === 50013) {
      return NextResponse.json({ error: 'Bot bu işlem için yeterli yetkiye sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message || 'İşlem başarısız' }, { status: 500 })
  }
}
