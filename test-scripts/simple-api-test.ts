#!/usr/bin/env tsx

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function simpleTest() {
  const apiKey = process.env.PERPLEXITY_API_KEY
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not found')
    process.exit(1)
  }

  console.log('Testing direct API call for 10 destinations...')
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: 'Output only JSON. No explanations.'
          },
          { 
            role: 'user', 
            content: 'Generate array with 10 vacation destinations. Each has: destination, country, description. Format: [{"destination":"Paris","country":"France","description":"City of lights"},...] Output ONLY the JSON array.'
          }
        ],
        temperature: 0.3,
        max_tokens: 5000
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      console.error('API Error:', error)
      process.exit(1)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    console.log('Response length:', content.length)
    console.log('First 200 chars:', content.substring(0, 200))
    
    // Try to count destinations
    const matches = content.match(/"destination"\s*:/g)
    console.log(`\nFound ${matches ? matches.length : 0} "destination" fields`)
    
    if (matches && matches.length === 10) {
      console.log('✅ Perfect! Got exactly 10 destinations')
    } else {
      console.log(`⚠️ Got ${matches ? matches.length : 0} destinations instead of 10`)
    }
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Request timed out after 20 seconds')
    } else {
      console.error('Error:', error.message)
    }
    process.exit(1)
  }
}

simpleTest()