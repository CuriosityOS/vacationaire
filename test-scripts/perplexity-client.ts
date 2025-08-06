import { z } from 'zod'
import { VacationRecommendationsArraySchema } from './schemas'
import { UserPreferences } from '@/types'

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface TestResult {
  success: boolean
  data?: z.infer<typeof VacationRecommendationsArraySchema>
  error?: string
  rawResponse?: string
  attempts: number
  sanitizedResponse?: string
  parseError?: string
}

export class PerplexityClient {
  private apiKey: string
  private model: string
  private maxRetries: number
  private debug: boolean

  constructor(apiKey: string, model: string = 'sonar', maxRetries: number = 3, debug: boolean = true) {
    this.apiKey = apiKey
    this.model = model
    this.maxRetries = maxRetries
    this.debug = debug
  }

  private log(message: string, data?: any) {
    if (this.debug) {
      console.log(`[PerplexityClient] ${message}`, data || '')
    }
  }

  /**
   * Sanitize LLM output to extract JSON
   */
  private sanitizeLlmOutput(rawResponse: string): string | null {
    this.log('Sanitizing response...')
    
    // Try multiple sanitization strategies
    let cleaned = rawResponse.trim()
    
    // Strategy 1: Remove markdown code blocks
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    
    // Strategy 2: Remove common prefixes
    const prefixPatterns = [
      /^Here (?:is|are) (?:the|your|10|ten) (?:vacation |)recommendations?:?\s*/i,
      /^I've generated (?:the |)(?:10 |ten |)recommendations?:?\s*/i,
      /^Based on your preferences.*?:\s*/i,
      /^Here's the JSON array.*?:\s*/i,
    ]
    
    for (const pattern of prefixPatterns) {
      cleaned = cleaned.replace(pattern, '')
    }
    
    // Strategy 3: Find JSON array boundaries
    const firstBracket = cleaned.indexOf('[')
    const lastBracket = cleaned.lastIndexOf(']')
    
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    } else {
      this.log('No valid JSON array boundaries found')
      return null
    }
    
    // Strategy 4: Fix common JSON syntax errors
    cleaned = cleaned
      .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/}\s*{/g, '},{') // Add commas between adjacent objects
      .replace(/]\s*\[/g, '],[') // Add commas between adjacent arrays
    
    this.log('Sanitized to:', cleaned.substring(0, 200) + '...')
    return cleaned
  }

  /**
   * Build the prompt for a specific attempt
   */
  private buildPrompt(preferences: UserPreferences, attemptNumber: number): { system: string; user: string } {
    const budget = `${preferences.budget.currency} ${preferences.budget.min}-${preferences.budget.max}`
    
    // Different prompt strategies for different attempts
    if (attemptNumber === 1) {
      // Golden prompt - most explicit and structured
      return {
        system: `You are a JSON-only API that generates vacation recommendations. You must respond with ONLY a valid JSON array containing exactly 10 vacation destination objects. 

CRITICAL RULES:
1. Your ENTIRE response must be valid JSON starting with [ and ending with ]
2. Do NOT include any text before the [
3. Do NOT include any text after the ]
4. Do NOT use markdown formatting like \`\`\`json
5. Do NOT include explanations or apologies
6. ONLY output the raw JSON array

Each destination object must have ALL these fields with the exact names and types specified.`,
        user: `Generate 10 vacation recommendations for:
- Budget: ${budget}
- Duration: ${preferences.duration.days} days
- Trip Type: ${preferences.tripType}
- Activities: ${preferences.activities.join(', ')}
- Climate: ${preferences.climate}
- Pace: ${preferences.pace}

Return EXACTLY this JSON structure with 10 destinations:
[
  {
    "destination": "City Name",
    "country": "Country Name",
    "description": "A compelling description of the destination",
    "estimatedCost": {
      "total": 2500,
      "breakdown": {
        "accommodation": 800,
        "transportation": 600,
        "food": 600,
        "activities": 500
      }
    },
    "highlights": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
    "activities": [
      {
        "name": "Activity Name",
        "description": "Activity description",
        "duration": "2 hours",
        "cost": 50,
        "type": "adventure"
      }
    ],
    "accommodations": [
      {
        "name": "Hotel Name",
        "type": "Hotel",
        "pricePerNight": 150,
        "amenities": ["WiFi", "Pool"],
        "sustainabilityFeatures": ["Solar Power"]
      }
    ],
    "transportation": [
      {
        "mode": "Metro",
        "carbonEmissions": 5,
        "cost": 20,
        "duration": "30 minutes"
      }
    ],
    "sustainabilityScore": {
      "overall": 7,
      "description": "Good eco-friendly options",
      "tips": ["Use public transport", "Support local businesses"]
    },
    "weather": {
      "temperature": {"min": 20, "max": 30},
      "conditions": "Sunny and warm",
      "bestMonths": ["May", "June", "September"]
    },
    "localCuisine": ["Dish 1", "Dish 2", "Dish 3"],
    "culturalTips": ["Tip 1", "Tip 2", "Tip 3"],
    "imageUrl": "https://images.unsplash.com/photo-example?w=800&q=80"
  }
]

START YOUR RESPONSE WITH [ AND END WITH ]`
      }
    } else if (attemptNumber === 2) {
      // Even more explicit
      return {
        system: 'You are a JSON generator. Output ONLY valid JSON. No text, no markdown, no explanations. Start with [ and end with ]',
        user: `Create JSON array with 10 vacation destinations for budget ${budget}, ${preferences.duration.days} days, ${preferences.tripType} trip.

Each destination needs: destination, country, description, estimatedCost (with total and breakdown), highlights array, activities array, accommodations array, transportation array, sustainabilityScore object, weather object, localCuisine array, culturalTips array, imageUrl.

Output format: [{"destination":"...","country":"...","description":"...",...},...]

NO TEXT BEFORE OR AFTER THE JSON!`
      }
    } else {
      // Simplest prompt
      return {
        system: 'Return only JSON',
        user: `10 vacation destinations as JSON array for ${budget} budget, ${preferences.duration.days} days. Include all fields: destination, country, description, estimatedCost, highlights, activities, accommodations, transportation, sustainabilityScore, weather, localCuisine, culturalTips, imageUrl. Start with [ end with ]`
      }
    }
  }

  /**
   * Make a single API call to Perplexity
   */
  private async callPerplexityApi(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON
        max_tokens: 15000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API call failed: ${error}`)
    }

    const data = await response.json() as PerplexityResponse
    return data.choices[0].message.content
  }

  /**
   * Generate recommendations with retry logic
   */
  async generateRecommendations(preferences: UserPreferences): Promise<TestResult> {
    let lastError: string = ''
    let lastRawResponse: string = ''
    let lastSanitizedResponse: string = ''
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      this.log(`Attempt ${attempt}/${this.maxRetries}`)
      
      try {
        // Build prompt for this attempt
        const { system, user } = this.buildPrompt(preferences, attempt)
        
        // Call API
        const rawResponse = await this.callPerplexityApi(system, user)
        lastRawResponse = rawResponse
        this.log(`Raw response length: ${rawResponse.length}`)
        this.log(`First 300 chars: ${rawResponse.substring(0, 300)}`)
        
        // Sanitize response
        const sanitized = this.sanitizeLlmOutput(rawResponse)
        if (!sanitized) {
          lastError = 'Failed to extract JSON from response'
          continue
        }
        lastSanitizedResponse = sanitized
        
        // Try to parse JSON
        let parsed: any
        try {
          parsed = JSON.parse(sanitized)
        } catch (parseError: any) {
          lastError = `JSON parse error: ${parseError.message}`
          this.log('Parse error:', parseError)
          continue
        }
        
        // Validate with Zod schema
        const validationResult = VacationRecommendationsArraySchema.safeParse(parsed)
        
        if (validationResult.success) {
          this.log(`SUCCESS on attempt ${attempt}!`)
          return {
            success: true,
            data: validationResult.data,
            attempts: attempt,
            rawResponse: lastRawResponse,
            sanitizedResponse: lastSanitizedResponse
          }
        } else {
          const errors = validationResult.error?.issues || []
          lastError = `Schema validation failed: ${JSON.stringify(errors.slice(0, 3))}`
          this.log('Validation errors:', errors)
        }
        
      } catch (error: any) {
        lastError = error.message
        this.log(`Attempt ${attempt} failed:`, error)
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < this.maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        this.log(`Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    // All attempts failed
    return {
      success: false,
      error: lastError,
      rawResponse: lastRawResponse,
      sanitizedResponse: lastSanitizedResponse,
      attempts: this.maxRetries,
      parseError: lastError
    }
  }
}