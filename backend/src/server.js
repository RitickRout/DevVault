import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { config } from 'dotenv'

// Load environment variables
config()

// Import routes
import toolsRoutes from './routes/tools.js'
import authRoutes from './routes/auth.js'
import utilsRoutes from './routes/utils.js'

const start = async () => {
  const fastify = Fastify({
    logger: process.env.NODE_ENV === 'production' 
      ? true 
      : {
          level: process.env.LOG_LEVEL || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
        }
  })

  try {
    // Register plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: false
    })

    await fastify.register(cors, {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    })

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    })

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'devvault-secret-key-change-in-production'
    })

    // Health check route
    fastify.get('/health', async (request, reply) => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
      }
    })

    // API routes
    await fastify.register(toolsRoutes, { prefix: '/api/tools' })
    await fastify.register(authRoutes, { prefix: '/api/auth' })
    await fastify.register(utilsRoutes, { prefix: '/api/utils' })

    // Global error handler
    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error)
      
      if (error.validation) {
        reply.status(400).send({
          error: 'Validation Error',
          message: error.message,
          details: error.validation
        })
        return
      }
      
      reply.status(error.statusCode || 500).send({
        error: error.name || 'Internal Server Error',
        message: error.message
      })
    })

    const port = process.env.PORT || 3001
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    console.log(`🚀 DevVault API server running on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
