import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
let genAI = null

const initializeGemini = (apiKey) => {
  if (!apiKey) {
    throw new Error('Gemini API key is required')
  }
  genAI = new GoogleGenerativeAI(apiKey)
}

const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please provide an API key.')
  }
  return genAI.getGenerativeModel({ model: 'gemini-pro' })
}

// SQL generation prompt template
const createSQLPrompt = (userRequest, schema, dbType) => {
  return `You are QueryForge, an advanced AI-powered SQL query generator. Convert the following natural language request into a clean, optimized, and secure SQL query.

Database Type: ${dbType}
Schema Information: ${schema || 'No schema provided'}

User Request: "${userRequest}"

Rules:
1. Generate valid ${dbType} syntax only
2. Use proper table names and columns based on the schema
3. Never delete, drop, or alter tables unless explicitly requested
4. Prefer SELECT statements unless explicitly asked for INSERT, UPDATE, or DELETE
5. Optimize queries for performance with proper LIMIT and indexing conditions
6. Use parameterized queries to prevent SQL injection
7. Return only the SQL query without explanations unless asked

SQL Query:`
}

// Generate SQL query using Gemini
export const generateSQLQuery = async (userRequest, schema = '', dbType = 'MySQL', apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('Please provide your Gemini API key to use QueryForge')
    }

    // Initialize Gemini if not already done or if API key changed
    initializeGemini(apiKey)
    
    const model = getGeminiModel()
    const prompt = createSQLPrompt(userRequest, schema, dbType)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    let sqlQuery = response.text()
    
    // Clean up the response - remove markdown formatting if present
    sqlQuery = sqlQuery.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Validate that we got a SQL query
    if (!sqlQuery || sqlQuery.length < 5) {
      throw new Error('Failed to generate a valid SQL query')
    }
    
    return {
      success: true,
      query: sqlQuery,
      dbType: dbType
    }
  } catch (error) {
    console.error('Error generating SQL query:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate SQL query',
      query: ''
    }
  }
}

// Explain SQL query using Gemini
export const explainSQLQuery = async (sqlQuery, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('Please provide your Gemini API key')
    }

    initializeGemini(apiKey)
    const model = getGeminiModel()
    
    const prompt = `Explain the following SQL query in simple terms. Break down what each part does and what the query will return:

SQL Query:
${sqlQuery}

Explanation:`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const explanation = response.text().trim()
    
    return {
      success: true,
      explanation: explanation
    }
  } catch (error) {
    console.error('Error explaining SQL query:', error)
    return {
      success: false,
      error: error.message || 'Failed to explain SQL query',
      explanation: ''
    }
  }
}

// Optimize SQL query using Gemini
export const optimizeSQLQuery = async (sqlQuery, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('Please provide your Gemini API key')
    }

    initializeGemini(apiKey)
    const model = getGeminiModel()
    
    const prompt = `Optimize the following SQL query for better performance. Provide the optimized query and explain the improvements:

Original Query:
${sqlQuery}

Optimized Query:`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    let optimizedContent = response.text().trim()
    
    // Try to extract just the SQL query part
    const sqlMatch = optimizedContent.match(/```sql\n?(.*?)\n?```/s)
    if (sqlMatch) {
      optimizedContent = sqlMatch[1].trim()
    }
    
    return {
      success: true,
      optimizedQuery: optimizedContent
    }
  } catch (error) {
    console.error('Error optimizing SQL query:', error)
    return {
      success: false,
      error: error.message || 'Failed to optimize SQL query',
      optimizedQuery: ''
    }
  }
}
