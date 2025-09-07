import { z } from 'zod'

const urlEncodeSchema = z.object({
  text: z.string()
})

const colorConvertSchema = z.object({
  color: z.string(),
  from: z.enum(['hex', 'rgb', 'hsl']),
  to: z.enum(['hex', 'rgb', 'hsl'])
})

async function utilsRoutes(fastify, options) {
  // URL Encoder/Decoder
  fastify.post('/url/encode', async (request, reply) => {
    try {
      const { text } = urlEncodeSchema.parse(request.body)
      const encoded = encodeURIComponent(text)
      
      return {
        success: true,
        encoded,
        originalLength: text.length,
        encodedLength: encoded.length
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'URL encode failed',
        message: error.message
      })
    }
  })

  fastify.post('/url/decode', async (request, reply) => {
    try {
      const { text } = request.body
      const decoded = decodeURIComponent(text)
      
      return {
        success: true,
        decoded,
        originalLength: text.length,
        decodedLength: decoded.length
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'URL decode failed',
        message: error.message
      })
    }
  })

  // HTML Entity Encoder/Decoder
  fastify.post('/html/encode', async (request, reply) => {
    try {
      const { text } = request.body
      const encoded = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
      
      return {
        success: true,
        encoded
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'HTML encode failed',
        message: error.message
      })
    }
  })

  fastify.post('/html/decode', async (request, reply) => {
    try {
      const { text } = request.body
      const decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
      
      return {
        success: true,
        decoded
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'HTML decode failed',
        message: error.message
      })
    }
  })

  // Color Converter
  fastify.post('/color/convert', async (request, reply) => {
    try {
      const { color, from, to } = colorConvertSchema.parse(request.body)
      
      let result
      
      if (from === 'hex' && to === 'rgb') {
        result = hexToRgb(color)
      } else if (from === 'rgb' && to === 'hex') {
        result = rgbToHex(color)
      } else if (from === 'hex' && to === 'hsl') {
        const rgb = hexToRgb(color)
        result = rgbToHsl(rgb)
      } else if (from === 'hsl' && to === 'hex') {
        const rgb = hslToRgb(color)
        result = rgbToHex(rgb)
      } else if (from === 'rgb' && to === 'hsl') {
        result = rgbToHsl(color)
      } else if (from === 'hsl' && to === 'rgb') {
        result = hslToRgb(color)
      } else {
        throw new Error('Invalid color conversion')
      }
      
      return {
        success: true,
        original: color,
        converted: result,
        from,
        to
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Color conversion failed',
        message: error.message
      })
    }
  })

  // Text Statistics
  fastify.post('/text/stats', async (request, reply) => {
    try {
      const { text } = request.body
      
      const stats = {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim().split(/\s+/).filter(word => word.length > 0).length,
        lines: text.split('\n').length,
        paragraphs: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        averageWordsPerSentence: 0,
        readingTime: 0
      }
      
      if (stats.sentences > 0) {
        stats.averageWordsPerSentence = Math.round(stats.words / stats.sentences * 100) / 100
      }
      
      // Estimate reading time (average 200 words per minute)
      stats.readingTime = Math.ceil(stats.words / 200)
      
      return {
        success: true,
        stats
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Text analysis failed',
        message: error.message
      })
    }
  })

  // JSON to other formats
  fastify.post('/convert/json-to-csv', async (request, reply) => {
    try {
      const { json } = request.body
      const data = JSON.parse(json)
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array for CSV conversion')
      }
      
      const csv = convertJsonToCsv(data)
      
      return {
        success: true,
        csv
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'JSON to CSV conversion failed',
        message: error.message
      })
    }
  })

  // Get Git command suggestions
  fastify.get('/git/commands', async (request, reply) => {
    const commands = [
      {
        category: 'Basic',
        commands: [
          { name: 'git init', description: 'Initialize a new Git repository' },
          { name: 'git clone <url>', description: 'Clone a repository' },
          { name: 'git status', description: 'Show working tree status' },
          { name: 'git add <file>', description: 'Add file to staging area' },
          { name: 'git commit -m "<message>"', description: 'Commit changes' },
          { name: 'git push', description: 'Push changes to remote' },
          { name: 'git pull', description: 'Pull changes from remote' }
        ]
      },
      {
        category: 'Branching',
        commands: [
          { name: 'git branch', description: 'List branches' },
          { name: 'git branch <name>', description: 'Create new branch' },
          { name: 'git checkout <branch>', description: 'Switch to branch' },
          { name: 'git merge <branch>', description: 'Merge branch' },
          { name: 'git branch -d <branch>', description: 'Delete branch' }
        ]
      },
      {
        category: 'History',
        commands: [
          { name: 'git log', description: 'Show commit history' },
          { name: 'git log --oneline', description: 'Show condensed history' },
          { name: 'git diff', description: 'Show changes' },
          { name: 'git show <commit>', description: 'Show commit details' }
        ]
      }
    ]
    
    return {
      success: true,
      commands
    }
  })
}

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHex(rgb) {
  if (typeof rgb === 'string') {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
    }
  }
  return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
}

function rgbToHsl(rgb) {
  if (typeof rgb === 'string') {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
    }
  }
  
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function hslToRgb(hsl) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return null
  
  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

function convertJsonToCsv(data) {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? `"${value}"` : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

export default utilsRoutes
