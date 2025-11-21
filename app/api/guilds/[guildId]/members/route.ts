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

    await guild.members.fetch()

    const roles: any = {}
    guild.members.cache.forEach(member => {
      const highestRole = member.roles.highest
      const roleName = highestRole.name === '@everyone' ? 'Üyeler' : highestRole.name
      const roleColor = highestRole.color || null

      if (!roles[roleName]) {
        roles[roleName] = {
          name: roleName,
          color: roleColor,
          position: highestRole.position,
          members: []
        }
      }

      roles[roleName].members.push({
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        avatar: member.user.displayAvatarURL(),
        status: member.presence?.status || 'offline',
        activity: member.presence?.activities[0]?.name || null,
        bot: member.user.bot
      })
    })

    const sortedRoles = Object.values(roles).sort((a: any, b: any) => b.position - a.position)

    return NextResponse.json(sortedRoles)
  } catch (error) {
    console.error('Members hatası:', error)
    return NextResponse.json({ error: 'Üyeler alınamadı' }, { status: 500 })
  }
}
