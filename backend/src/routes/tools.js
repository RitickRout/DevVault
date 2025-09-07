import crypto from 'crypto'
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Validation schemas
const jsonFormatSchema = z.object({
  json: z.string(),
  indent: z.number().min(0).max(8).default(2)
})

const hashGenerateSchema = z.object({
  text: z.string(),
  algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha512']).default('sha256')
})

const jwtDecodeSchema = z.object({
  token: z.string()
})

const regexTestSchema = z.object({
  pattern: z.string(),
  text: z.string(),
  flags: z.string().optional()
})

async function toolsRoutes(fastify, options) {
  // JSON Formatter
  fastify.post('/json/format', async (request, reply) => {
    try {
      const { json, indent } = jsonFormatSchema.parse(request.body)
      
      // Validate JSON
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, indent)
      
      // Calculate stats
      const size = Buffer.byteLength(formatted, 'utf8')
      const keys = countJsonKeys(parsed)
      const depth = calculateJsonDepth(parsed)
      const arrayItems = countArrayItems(parsed)
      
      return {
        success: true,
        formatted,
        stats: {
          size,
          keys,
          depth,
          arrayItems,
          type: Array.isArray(parsed) ? 'array' : typeof parsed
        }
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid JSON',
        message: error.message
      })
    }
  })

  // JSON Minifier
  fastify.post('/json/minify', async (request, reply) => {
    try {
      const { json } = request.body
      const parsed = JSON.parse(json)
      const minified = JSON.stringify(parsed)
      
      return {
        success: true,
        minified,
        originalSize: Buffer.byteLength(json, 'utf8'),
        minifiedSize: Buffer.byteLength(minified, 'utf8')
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid JSON',
        message: error.message
      })
    }
  })

  // Hash Generator
  fastify.post('/hash/generate', async (request, reply) => {
    try {
      const { text, algorithm } = hashGenerateSchema.parse(request.body)
      
      let hash
      switch (algorithm) {
        case 'md5':
          hash = CryptoJS.MD5(text).toString()
          break
        case 'sha1':
          hash = CryptoJS.SHA1(text).toString()
          break
        case 'sha256':
          hash = CryptoJS.SHA256(text).toString()
          break
        case 'sha512':
          hash = CryptoJS.SHA512(text).toString()
          break
      }
      
      return {
        success: true,
        algorithm,
        hash,
        length: hash.length
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Hash generation failed',
        message: error.message
      })
    }
  })

  // UUID Generator
  fastify.post('/uuid/generate', async (request, reply) => {
    try {
      const count = request.body?.count || 1
      const uuids = Array.from({ length: Math.min(count, 100) }, () => uuidv4())
      
      return {
        success: true,
        uuids,
        count: uuids.length
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'UUID generation failed',
        message: error.message
      })
    }
  })

  // JWT Decoder
  fastify.post('/jwt/decode', async (request, reply) => {
    try {
      const { token } = jwtDecodeSchema.parse(request.body)
      
      // Decode without verification (for debugging purposes)
      const decoded = jwt.decode(token, { complete: true })
      
      if (!decoded) {
        throw new Error('Invalid JWT token')
      }
      
      return {
        success: true,
        header: decoded.header,
        payload: decoded.payload,
        signature: decoded.signature
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'JWT decode failed',
        message: error.message
      })
    }
  })

  // JWT Encoder (basic - without secret)
  fastify.post('/jwt/encode', async (request, reply) => {
    try {
      const { header, payload } = request.body
      
      // Create a demo JWT (not for production use)
      const token = jwt.sign(payload, 'demo-secret', {
        algorithm: header?.alg || 'HS256',
        header: header
      })
      
      return {
        success: true,
        token,
        warning: 'This is a demo token. Do not use in production.'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'JWT encode failed',
        message: error.message
      })
    }
  })

  // Regex Tester
  fastify.post('/regex/test', async (request, reply) => {
    try {
      const { pattern, text, flags = 'g' } = regexTestSchema.parse(request.body)
      
      const regex = new RegExp(pattern, flags)
      const matches = [...text.matchAll(regex)]
      
      return {
        success: true,
        matches: matches.map(match => ({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })),
        matchCount: matches.length,
        isValid: true
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Regex test failed',
        message: error.message,
        isValid: false
      })
    }
  })

  // Base64 Encoder/Decoder
  fastify.post('/base64/encode', async (request, reply) => {
    try {
      const { text } = request.body
      const encoded = Buffer.from(text, 'utf8').toString('base64')
      
      return {
        success: true,
        encoded,
        originalLength: text.length,
        encodedLength: encoded.length
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Base64 encode failed',
        message: error.message
      })
    }
  })

  fastify.post('/base64/decode', async (request, reply) => {
    try {
      const { encoded } = request.body
      const decoded = Buffer.from(encoded, 'base64').toString('utf8')
      
      return {
        success: true,
        decoded,
        originalLength: encoded.length,
        decodedLength: decoded.length
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Base64 decode failed',
        message: error.message
      })
    }
  })
}

// Helper functions
function countJsonKeys(obj, visited = new Set()) {
  if (visited.has(obj) || typeof obj !== 'object' || obj === null) {
    return 0
  }
  
  visited.add(obj)
  let count = 0
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countJsonKeys(item, visited)
    }
  } else {
    count += Object.keys(obj).length
    for (const value of Object.values(obj)) {
      count += countJsonKeys(value, visited)
    }
  }
  
  return count
}

function calculateJsonDepth(obj, currentDepth = 0) {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth
  }
  
  let maxDepth = currentDepth
  const values = Array.isArray(obj) ? obj : Object.values(obj)
  
  for (const value of values) {
    const depth = calculateJsonDepth(value, currentDepth + 1)
    maxDepth = Math.max(maxDepth, depth)
  }
  
  return maxDepth
}

function countArrayItems(obj, visited = new Set()) {
  if (visited.has(obj) || typeof obj !== 'object' || obj === null) {
    return 0
  }
  
  visited.add(obj)
  let count = 0
  
  if (Array.isArray(obj)) {
    count += obj.length
    for (const item of obj) {
      count += countArrayItems(item, visited)
    }
  } else {
    for (const value of Object.values(obj)) {
      count += countArrayItems(value, visited)
    }
  }
  
  return count
}

export default toolsRoutes
