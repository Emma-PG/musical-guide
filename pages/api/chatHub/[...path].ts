import { NextApiRequest, NextApiResponse } from 'next'
import httpProxy from 'http-proxy'
import type { Server as HTTPServer, IncomingMessage, ServerResponse } from 'http'
import type { Socket } from 'net'

const target = 'http://localhost:5171'

const proxy = httpProxy.createProxyServer({ target, changeOrigin: true, ws: true, secure: false })

let upgradeAttached = false

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!upgradeAttached) {
    upgradeAttached = true
    const server = ((res.socket as any)?.server) as HTTPServer | undefined
    if (server) {
      server.on('upgrade', (req2: IncomingMessage, socket: Socket, head: Buffer) => {
        if (req2.url && req2.url.startsWith('/api/chatHub')) {
          req2.url = req2.url.replace('/api/chatHub', '/chatHub')
          proxy.ws(req2, socket, head)
        }
      })
    }
  }

  // rewrite path so requests to /api/chatHub/... map to /chatHub/...
  if (req.url) req.url = req.url.replace(/^\/api\/chatHub/, '/chatHub')

  proxy.web(req as unknown as IncomingMessage, res as unknown as ServerResponse)
  proxy.on('error', (err: Error) => {
    console.error('Proxy error:', err)
    if (!res.headersSent) {
      res.status(500).end('Proxy error')
    } else {
      try {
        res.end()
      } catch {}
    }
  })
}
