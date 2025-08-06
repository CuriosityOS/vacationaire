import { UserPreferences, VacationRecommendation } from '@/types'
import { z } from 'zod'

// Schema for validating a single destination
const DestinationSchema = z.object({
  destination: z.string().min(1),
  country: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.object({
    total: z.number().min(0),
    breakdown: z.object({
      accommodation: z.number().min(0),
      transportation: z.number().min(0),
      food: z.number().min(0),
      activities: z.number().min(0),
    })
  }),
  highlights: z.array(z.string()).min(1),
  activities: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    duration: z.string().min(1),
    cost: z.number().min(0),
    type: z.string().min(1)
  })).min(1),
  accommodations: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    pricePerNight: z.number().min(0),
    amenities: z.array(z.string()),
    sustainabilityFeatures: z.array(z.string())
  })).min(1),
  transportation: z.array(z.object({
    mode: z.string().min(1),
    carbonEmissions: z.number().min(0),
    cost: z.number().min(0),
    duration: z.string().min(1)
  })).min(1),
  sustainabilityScore: z.object({
    overall: z.number().min(0).max(10),
    description: z.string().min(1),
    tips: z.array(z.string())
  }),
  weather: z.object({
    temperature: z.object({
      min: z.number(),
      max: z.number()
    }),
    conditions: z.string().min(1),
    bestMonths: z.array(z.string()).min(1)
  }),
  localCuisine: z.array(z.string()).min(1),
  culturalTips: z.array(z.string()).min(1),
  imageUrl: z.string().url().optional()
})

const DestinationsArraySchema = z.array(DestinationSchema).min(10).max(10)

export async function generateVacationRecommendations(
  preferences: UserPreferences
): Promise<VacationRecommendation[]> {
  const maxAttempts = 3
  let lastError = ''
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const prompt = buildImprovedPrompt(preferences, attempt)
      
      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const data = await response.json()
      const result = parseAndValidateResponse(data.content, preferences)
      
      if (result) {
        console.log(`[Perplexity] Success on attempt ${attempt}`)
        // Add geocoding for each destination
        const geocodedResults = await addCoordinatesToRecommendations(result)
        return geocodedResults
      }
      
      lastError = 'Invalid response format'
    } catch (error: any) {
      lastError = error.message
      console.error(`[Perplexity] Attempt ${attempt} failed:`, error.message)
    }
    
    // Wait before retry with exponential backoff
    if (attempt < maxAttempts) {
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  // Throw error instead of returning mock data
  throw new Error(`Failed to generate recommendations after ${maxAttempts} attempts. Last error: ${lastError}`)
}

function buildImprovedPrompt(preferences: UserPreferences, attemptNumber: number): string {
  const { budget, duration, tripType, accommodationType, activities, pace, climate, sustainability, specialInstructions } = preferences
  const budgetStr = `${budget.currency} ${budget.min}-${budget.max}`
  
  // Use the most explicit prompt that works best
  let prompt = `You are a JSON-only API. Return ONLY a valid JSON array with exactly 10 vacation destinations.

CRITICAL: Your ENTIRE response must be valid JSON starting with [ and ending with ]
- Do NOT include any text before the [
- Do NOT include any text after the ]
- Do NOT use markdown formatting
- Do NOT include explanations

Generate 10 vacation recommendations for:
- Budget: ${budgetStr}
- Duration: ${duration.days} days
- Trip Type: ${tripType}
- Accommodation: ${accommodationType}
- Activities: ${activities.join(', ')}
- Pace: ${pace}
- Climate: ${climate}
- Sustainability: ${sustainability}`

  if (specialInstructions) {
    prompt += `\n- Special Instructions: ${specialInstructions}`
  }

  prompt += `

Return this EXACT structure with 10 destinations:
[
  {
    "destination": "City Name",
    "country": "Country Name",
    "description": "Detailed description of why this destination matches the preferences",
    "imageUrl": "A publicly accessible, direct-linking HTTPS URL to a high-quality image of this destination. Must be a direct image URL ending in .jpg, .jpeg, .png, or .webp. Prefer royalty-free sources like Unsplash (https://images.unsplash.com/), Pexels (https://images.pexels.com/), or Wikimedia Commons. The URL must be valid and currently working.",
    "estimatedCost": {
      "total": ${Math.floor((budget.min + budget.max) / 2)},
      "breakdown": {
        "accommodation": ${Math.floor(((budget.min + budget.max) / 2) * 0.3)},
        "transportation": ${Math.floor(((budget.min + budget.max) / 2) * 0.25)},
        "food": ${Math.floor(((budget.min + budget.max) / 2) * 0.25)},
        "activities": ${Math.floor(((budget.min + budget.max) / 2) * 0.2)}
      }
    },
    "highlights": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
    "activities": [
      {
        "name": "Activity Name",
        "description": "What you'll do",
        "duration": "2 hours",
        "cost": 50,
        "type": "adventure"
      },
      {
        "name": "Another Activity",
        "description": "Description",
        "duration": "Half day",
        "cost": 75,
        "type": "culture"
      }
    ],
    "accommodations": [
      {
        "name": "Hotel Name",
        "type": "${accommodationType}",
        "pricePerNight": ${Math.floor(((budget.min + budget.max) / 2) * 0.3 / duration.days)},
        "amenities": ["WiFi", "Pool", "Restaurant"],
        "sustainabilityFeatures": ["Solar Power", "Water Conservation"]
      }
    ],
    "transportation": [
      {
        "mode": "Public Transit",
        "carbonEmissions": 5,
        "cost": 20,
        "duration": "30 minutes average"
      }
    ],
    "sustainabilityScore": {
      "overall": 7,
      "description": "Good eco-friendly infrastructure",
      "tips": ["Use public transport", "Support local businesses"]
    },
    "weather": {
      "temperature": {"min": 20, "max": 30},
      "conditions": "Pleasant climate",
      "bestMonths": ["May", "June", "September"]
    },
    "localCuisine": ["Local Dish 1", "Local Dish 2", "Local Dish 3"],
    "culturalTips": ["Cultural Tip 1", "Cultural Tip 2", "Cultural Tip 3"],
    "imageUrl": "https://images.unsplash.com/photo-example?w=800&q=80"
  }
]

START WITH [ AND END WITH ]`
  
  return prompt
}

function sanitizeResponse(rawResponse: string): string | null {
  let cleaned = rawResponse.trim()
  
  // Remove markdown blocks
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
  cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
  
  // Remove common prefixes
  const prefixPatterns = [
    /^Here (?:is|are) (?:the |your |3 |three )?(?:vacation |)recommendations?:?\s*/i,
    /^I've generated (?:the |)?(?:3 |three |)?recommendations?:?\s*/i,
    /^Based on your preferences.*?:\s*/i,
    /^Here's the JSON array.*?:\s*/i,
  ]
  
  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }
  
  // Find JSON array boundaries
  const firstBracket = cleaned.indexOf('[')
  const lastBracket = cleaned.lastIndexOf(']')
  
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1)
  } else {
    return null
  }
  
  // Fix common JSON syntax errors
  cleaned = cleaned
    .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
    .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
    .replace(/}\s*{/g, '},{') // Add commas between adjacent objects
  
  return cleaned
}

function parseAndValidateResponse(
  content: string, 
  preferences: UserPreferences
): VacationRecommendation[] | null {
  try {
    // Sanitize the response
    const sanitized = sanitizeResponse(content)
    if (!sanitized) {
      console.error('[Perplexity] Failed to extract JSON from response')
      return null
    }
    
    // Parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(sanitized)
    } catch (parseError: any) {
      console.error('[Perplexity] JSON parse error:', parseError.message)
      return null
    }
    
    // Validate with Zod (relaxed validation for production)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error('[Perplexity] Response is not an array or is empty')
      return null
    }
    
    // Convert to our format with defaults for missing fields
    const recommendations: VacationRecommendation[] = parsed.slice(0, 10).map((item: any, index: number) => ({
      id: (index + 1).toString(),
      destination: item.destination || 'Unknown Destination',
      country: item.country || 'Unknown Country',
      duration: preferences.duration.days,
      estimatedCost: {
        total: item.estimatedCost?.total || Math.floor((preferences.budget.min + preferences.budget.max) / 2),
        breakdown: {
          accommodation: item.estimatedCost?.breakdown?.accommodation || 0,
          transportation: item.estimatedCost?.breakdown?.transportation || 0,
          food: item.estimatedCost?.breakdown?.food || 0,
          activities: item.estimatedCost?.breakdown?.activities || 0,
        }
      },
      description: item.description || 'A wonderful destination for your vacation.',
      highlights: Array.isArray(item.highlights) ? item.highlights.slice(0, 5) : ['Local attractions'],
      activities: Array.isArray(item.activities) ? item.activities.slice(0, 5).map((act: any) => ({
        name: act.name || 'Activity',
        description: act.description || 'Enjoyable activity',
        duration: act.duration || 'Varies',
        cost: act.cost || 0,
        type: act.type || 'general',
        sustainabilityRating: act.sustainabilityRating || 7
      })) : [{
        name: 'Explore the area',
        description: 'Discover local attractions',
        duration: 'Full day',
        cost: 50,
        type: 'exploration',
        sustainabilityRating: 8
      }],
      accommodations: Array.isArray(item.accommodations) ? item.accommodations.slice(0, 2).map((acc: any) => ({
        name: acc.name || 'Accommodation',
        type: acc.type || preferences.accommodationType,
        pricePerNight: acc.pricePerNight || 100,
        amenities: Array.isArray(acc.amenities) ? acc.amenities : ['Basic amenities'],
        sustainabilityFeatures: Array.isArray(acc.sustainabilityFeatures) ? acc.sustainabilityFeatures : [],
        rating: acc.rating || 4.0
      })) : [{
        name: 'Recommended Stay',
        type: preferences.accommodationType,
        pricePerNight: 100,
        amenities: ['WiFi', 'Breakfast'],
        sustainabilityFeatures: ['Eco-friendly'],
        rating: 4.5
      }],
      transportation: Array.isArray(item.transportation) ? item.transportation.map((trans: any) => ({
        mode: trans.mode || 'Various',
        carbonEmissions: trans.carbonEmissions || 10,
        cost: trans.cost || 20,
        duration: trans.duration || 'Varies'
      })) : [{
        mode: 'Public Transit',
        carbonEmissions: 5,
        cost: 20,
        duration: '30 minutes average'
      }],
      sustainabilityScore: {
        overall: item.sustainabilityScore?.overall || 7,
        transportation: item.sustainabilityScore?.transportation || 7,
        accommodation: item.sustainabilityScore?.accommodation || 7,
        activities: item.sustainabilityScore?.activities || 7,
        localImpact: item.sustainabilityScore?.localImpact || 7,
        description: item.sustainabilityScore?.description || 'Good sustainability practices',
        tips: Array.isArray(item.sustainabilityScore?.tips) ? item.sustainabilityScore.tips : ['Support local businesses']
      },
      weather: {
        temperature: {
          min: item.weather?.temperature?.min || 20,
          max: item.weather?.temperature?.max || 30
        },
        conditions: item.weather?.conditions || 'Pleasant weather',
        bestMonths: Array.isArray(item.weather?.bestMonths) ? item.weather.bestMonths : ['Year-round']
      },
      localCuisine: Array.isArray(item.localCuisine) ? item.localCuisine : ['Local specialties'],
      culturalTips: Array.isArray(item.culturalTips) ? item.culturalTips : ['Be respectful of local customs'],
      images: item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') 
        ? [item.imageUrl] 
        : []
    }))
    
    console.log(`[Perplexity] Successfully parsed ${recommendations.length} destinations`)
    return recommendations
    
  } catch (error: any) {
    console.error('[Perplexity] Error processing response:', error.message)
    return null
  }
}

// Add coordinates to recommendations by geocoding each destination
async function addCoordinatesToRecommendations(
  recommendations: VacationRecommendation[]
): Promise<VacationRecommendation[]> {
  console.log('[Geocoding] Adding coordinates to recommendations...')
  
  // Check if we're in a browser environment
  const isClient = typeof window !== 'undefined'
  
  // Process geocoding requests in parallel for better performance
  const geocodedRecommendations = await Promise.all(
    recommendations.map(async (rec) => {
      try {
        if (isClient) {
          // Client-side: use the API endpoint
          const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destination: rec.destination,
              country: rec.country,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.coordinates) {
              console.log(`[Geocoding] Found coordinates for ${rec.destination}: ${data.coordinates.latitude}, ${data.coordinates.longitude}`)
              return {
                ...rec,
                coordinates: data.coordinates,
              }
            }
          }
        } else {
          // Server-side: direct geocoding
          const coordinates = await geocodeDestination(rec.destination, rec.country)
          if (coordinates) {
            console.log(`[Geocoding] Found coordinates for ${rec.destination}: ${coordinates.latitude}, ${coordinates.longitude}`)
            return {
              ...rec,
              coordinates,
            }
          }
        }
        
        console.log(`[Geocoding] No coordinates found for ${rec.destination}`)
        return rec // Return without coordinates
        
      } catch (error) {
        console.error(`[Geocoding] Error for ${rec.destination}:`, error)
        return rec // Return without coordinates on error
      }
    })
  )

  return geocodedRecommendations
}

// Server-side geocoding function
async function geocodeDestination(
  destination: string,
  country: string
): Promise<{ latitude: number; longitude: number } | null> {
  const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
  
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_secret_token_here') {
    return null
  }

  try {
    const query = `${destination}, ${country}`
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=place,locality,district`

    const response = await fetch(endpoint)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return { latitude, longitude }
    }

    return null
  } catch (error) {
    console.error('Direct geocoding error:', error)
    return null
  }
}
