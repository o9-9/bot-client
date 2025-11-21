const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { WebSocketServer } = require('ws')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let wss = null
const clients = new Map()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (ws) => {
    clients.set(ws, new Set())

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        
        if (message.type === 'subscribe' && message.channelId) {
          const channels = clients.get(ws)
          if (channels) {
            channels.add(message.channelId)
          }
        }
      } catch (error) {}
    })

    ws.on('close', () => {
      clients.delete(ws)
    })

    ws.on('error', () => {})
  })

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url)
    
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })

  global.broadcastMessage = (channelId, data) => {
    if (!wss) return

    const message = JSON.stringify(data)
    
    clients.forEach((subscribedChannels, ws) => {
      if (subscribedChannels.has(channelId) && ws.readyState === 1) {
        ws.send(message)
      }
    })
  }
})
