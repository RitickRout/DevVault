export const formatJson = async (jsonString, indent = 2) => {
  try {
    const parsed = JSON.parse(jsonString)
    const formatted = JSON.stringify(parsed, null, indent)
    
    const stats = {
      size: new Blob([formatted]).size,
      keys: countKeys(parsed),
      depth: calculateDepth(parsed),
      arrayItems: countArrayItems(parsed),
      type: Array.isArray(parsed) ? 'Array' : typeof parsed
    }
    
    return {
      formatted,
      stats,
      valid: true
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const validateJson = async (jsonString) => {
  try {
    JSON.parse(jsonString)
    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error.message 
    }
  }
}

export const minifyJson = async (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString)
    const minified = JSON.stringify(parsed)
    
    const stats = {
      size: new Blob([minified]).size,
      keys: countKeys(parsed),
      depth: calculateDepth(parsed),
      arrayItems: countArrayItems(parsed),
      type: Array.isArray(parsed) ? 'Array' : typeof parsed
    }
    
    return {
      minified,
      stats,
      valid: true
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const countKeys = (obj, visited = new Set()) => {
  if (visited.has(obj) || typeof obj !== 'object' || obj === null) {
    return 0
  }
  
  visited.add(obj)
  let count = 0
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countKeys(item, visited)
    }
  } else {
    count += Object.keys(obj).length
    for (const value of Object.values(obj)) {
      count += countKeys(value, visited)
    }
  }
  
  return count
}

const calculateDepth = (obj, currentDepth = 0) => {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth
  }
  
  let maxDepth = currentDepth
  const values = Array.isArray(obj) ? obj : Object.values(obj)
  
  for (const value of values) {
    const depth = calculateDepth(value, currentDepth + 1)
    maxDepth = Math.max(maxDepth, depth)
  }
  
  return maxDepth
}

const countArrayItems = (obj, visited = new Set()) => {
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
