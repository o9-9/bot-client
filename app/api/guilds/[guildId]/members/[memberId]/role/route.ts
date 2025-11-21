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

    const { roleId } = await request.json()

    if (!roleId) {
      return NextResponse.json({ error: 'Rol ID gerekli' }, { status: 400 })
    }

    const guild = client.guilds.cache.get(params.guildId)
    if (!guild) {
      return NextResponse.json({ error: 'Sunucu bulunamadı' }, { status: 404 })
    }

    const member = await guild.members.fetch(params.memberId)
    if (!member) {
      return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 })
    }

    const role = guild.roles.cache.get(roleId)
    if (!role) {
      return NextResponse.json({ error: 'Rol bulunamadı' }, { status: 404 })
    }

    await member.roles.add(role)

    return NextResponse.json({ message: `${role.name} rolü verildi` })
  } catch (error: any) {
    if (error.code === 50013) {
      return NextResponse.json({ error: 'Bot bu işlem için yeterli yetkiye sahip değil' }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message || 'Rol verilemedi' }, { status: 500 })
  }
}
