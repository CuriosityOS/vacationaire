import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY

    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY is not set')
      // Return mock data if no API key
      return NextResponse.json({
        content: 'Mock response - Please set PERPLEXITY_API_KEY in environment variables'
      })
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON API endpoint. Return ONLY a raw JSON array. Do not use markdown code blocks. Do not add any text before or after. Start with [ and end with ]. Ensure proper JSON syntax: double quotes for strings, no quotes for numbers, no trailing commas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 20000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Perplexity API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiContent = data.choices[0].message.content
    
    // Log the raw AI response for debugging
    console.log('[Perplexity API] Raw AI response length:', aiContent.length)
    console.log('[Perplexity API] First 500 chars:', aiContent.substring(0, 500))
    
    // Validate that the response looks like JSON
    const trimmedContent = aiContent.trim()
    const startsWithBracket = trimmedContent.startsWith('[')
    const endsWithBracket = trimmedContent.endsWith(']')
    
    if (!startsWithBracket || !endsWithBracket) {
      console.error('[Perplexity API] WARNING: Response doesn\'t look like a JSON array')
      console.error('[Perplexity API] Starts with [:', startsWithBracket)
      console.error('[Perplexity API] Ends with ]:', endsWithBracket)
      console.error('[Perplexity API] Full raw output:', aiContent)
    }
    
    // Try to parse to validate JSON
    try {
      const parsed = JSON.parse(trimmedContent)
      if (!Array.isArray(parsed)) {
        console.error('[Perplexity API] WARNING: Parsed response is not an array')
        console.error('[Perplexity API] Type:', typeof parsed)
        console.error('[Perplexity API] Value:', parsed)
      } else if (parsed.length === 0) {
        console.error('[Perplexity API] WARNING: Parsed array is empty')
      } else {
        console.log(`[Perplexity API] Successfully validated ${parsed.length} destinations`)
      }
    } catch (parseError) {
      console.error('[Perplexity API] PARSING FAILED: Response is not valid JSON')
      console.error('[Perplexity API] Parse error:', parseError.message)
      console.error('[Perplexity API] Full raw output that failed to parse:', aiContent)
    }
    
    return NextResponse.json({
      content: aiContent
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}