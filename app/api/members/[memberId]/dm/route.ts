import { NextRequest, NextResponse } from 'next/server'
import { getDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const client = getDiscordClient()

    if (!client || !client.user || !client.isReady()) {
      return NextResponse.json({ error: 'Bot giriş yapmamış' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 })
    }

    const user = await client.users.fetch(params.memberId)
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    await user.send(message)

    return NextResponse.json({ message: 'DM gönderildi' })
  } catch (error: any) {
    if (error.code === 50007) {
      return NextResponse.json({ error: 'Kullanıcı DM almayı kapatmış' }, { status: 403 })
    }
    
    return NextResponse.json({ error: error.message || 'DM gönderilemedi' }, { status: 500 })
  }
}
