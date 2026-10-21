import { Buffer } from 'node:buffer'
import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import login from './api/auth/login.js'
import session from './api/auth/session.js'
import dbTest from './api/db-test.js'
import register from './api/register.js'
import confirmPasswordReset from './api/password-reset/confirm.js'
import requestPasswordReset from './api/password-reset/request.js'
import users from './api/users.js'

const apiHandlers = new Map([
  ['/api/auth/login', login],
  ['/api/auth/session', session],
  ['/api/db-test', dbTest],
  ['/api/register', register],
  ['/api/password-reset/confirm', confirmPasswordReset],
  ['/api/password-reset/request', requestPasswordReset],
  ['/api/users', users],
])

function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const handler = apiHandlers.get(request.url?.split('?')[0])
        if (!handler) {
          next()
          return
        }

        const headers = {}
        const apiResponse = {
          statusCode: 200,
          status(code) {
            this.statusCode = code
            return this
          },
          setHeader(name, value) {
            headers[name] = value
          },
          json(body) {
            response.writeHead(this.statusCode, {
              'Cache-Control': 'no-store',
              'Content-Type': 'application/json; charset=utf-8',
              ...headers,
            })
            response.end(JSON.stringify(body))
          },
        }

        try {
          const chunks = []
          let bodyLength = 0
          for await (const chunk of request) {
            bodyLength += chunk.length
            if (bodyLength > 1_048_576) {
              response.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' })
              response.end(JSON.stringify({ success: false, message: 'Request body is too large' }))
              return
            }
            chunks.push(chunk)
          }

          const rawBody = Buffer.concat(chunks).toString('utf8')
          let body
          if (rawBody) {
            try {
              body = JSON.parse(rawBody)
            } catch {
              response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
              response.end(JSON.stringify({ success: false, message: 'Request body must be valid JSON' }))
              return
            }
          }

          await handler({
            method: request.method,
            headers: request.headers,
            body,
          }, apiResponse)
          if (!response.writableEnded) {
            response.writeHead(204)
            response.end()
          }
        } catch (error) {
          server.config.logger.error(`Local API request failed: ${error.message}`)
          if (!response.headersSent) {
            response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            response.end(JSON.stringify({ success: false, message: 'Local API request failed' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['DATABASE_URL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'APP_URL']) {
    if (!process.env[key] && env[key]) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [react(), localApiPlugin()],
  }
})
