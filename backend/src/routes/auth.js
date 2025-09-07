import jwt from 'jsonwebtoken'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

async function authRoutes(fastify, options) {
  // Mock user database (in production, use a real database)
  const users = new Map()
  
  // Register endpoint
  fastify.post('/register', async (request, reply) => {
    try {
      const { name, email, password } = registerSchema.parse(request.body)
      
      if (users.has(email)) {
        return reply.status(400).send({
          success: false,
          error: 'User already exists'
        })
      }
      
      // In production, hash the password
      const user = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString()
      }
      
      users.set(email, { ...user, password })
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'devvault-secret-key',
        { expiresIn: '7d' }
      )
      
      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Registration failed',
        message: error.message
      })
    }
  })
  
  // Login endpoint
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)
      
      const userData = users.get(email)
      if (!userData || userData.password !== password) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        })
      }
      
      const { password: _, ...user } = userData
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'devvault-secret-key',
        { expiresIn: '7d' }
      )
      
      return {
        success: true,
        user,
        token
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Login failed',
        message: error.message
      })
    }
  })
  
  // Get user profile
  fastify.get('/profile', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    }
  }, async (request, reply) => {
    const { email } = request.user
    const userData = users.get(email)
    
    if (!userData) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      })
    }
    
    const { password: _, ...user } = userData
    
    return {
      success: true,
      user
    }
  })
  
  // Refresh token
  fastify.post('/refresh', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    }
  }, async (request, reply) => {
    const { userId, email } = request.user
    
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'devvault-secret-key',
      { expiresIn: '7d' }
    )
    
    return {
      success: true,
      token
    }
  })
  
  // Logout (client-side token removal)
  fastify.post('/logout', async (request, reply) => {
    return {
      success: true,
      message: 'Logged out successfully'
    }
  })
}

export default authRoutes
