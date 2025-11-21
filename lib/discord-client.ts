import { Client, GatewayIntentBits, Partials } from 'discord.js'

declare global {
  var __discordClient: Client | undefined
  var broadcastMessage: ((channelId: string, data: any) => void) | undefined
}

export function getDiscordClient() {
  return global.__discordClient || null
}

export async function createDiscordClient(token: string) {
  if (global.__discordClient) {
    try {
      global.__discordClient.removeAllListeners()
      await global.__discordClient.destroy()
    } catch (error) {}
    global.__discordClient = undefined
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
  })

  global.__discordClient = client

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Discord client login timeout'))
    }, 30000)

    client.once('ready', async () => {
      clearTimeout(timeout)
      console.log(`✅ Bot: ${client.user?.tag} | Guilds: ${client.guilds.cache.size}`)
      
      try {
        const dmChannels = client.channels.cache.filter(ch => ch.isDMBased())
        console.log(`📬 DM Channels: ${dmChannels.size}`)
      } catch (error) {}
      
      client.on('messageCreate', (message) => {
        if (global.broadcastMessage) {
          global.broadcastMessage(message.channelId, {
            type: 'message',
            channelId: message.channelId,
            message: {
              id: message.id,
              content: message.content,
              author: {
                id: message.author.id,
                username: message.author.username,
                avatar: message.author.displayAvatarURL()
              },
              timestamp: message.createdTimestamp,
              reactions: []
            }
          })
        }
      })
      
      resolve()
    })

    client.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    client.login(token).catch((error) => {
      clearTimeout(timeout)
      reject(error)
    })
  })
  
  return global.__discordClient
}
