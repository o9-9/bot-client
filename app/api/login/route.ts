import { NextRequest, NextResponse } from 'next/server'
import { createDiscordClient } from '@/lib/discord-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 400 })
    }

    const discordClient = await createDiscordClient(token)

    return NextResponse.json({
      success: true,
      user: {
        id: discordClient.user?.id,
        username: discordClient.user?.username,
        avatar: discordClient.user?.avatar
      }
    })
  } catch (error) {
    console.error('Login hatası:', error)
    return NextResponse.json(
      { error: 'Geçersiz token veya giriş başarısız' },
      { status: 401 }
    )
  }
}
