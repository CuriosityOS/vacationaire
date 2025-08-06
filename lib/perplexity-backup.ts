import { UserPreferences, VacationRecommendation } from '@/types'

export async function generateVacationRecommendations(
  preferences: UserPreferences
): Promise<VacationRecommendation[]> {
  const prompt = buildPrompt(preferences)
  
  try {
    const response = await fetch('/api/perplexity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate recommendations')
    }

    const data = await response.json()
    return parseRecommendations(data.content, preferences)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return getMockRecommendations(preferences)
  }
}

function buildPrompt(preferences: UserPreferences): string {
  const { budget, duration, tripType, accommodationType, activities, pace, climate, sustainability, specialInstructions } = preferences
  
  let prompt = `Generate 3 detailed vacation recommendations based on these preferences:
    - Budget: $${budget.min} - $${budget.max} ${budget.currency}
    - Duration: ${duration.days} days
    - Trip Type: ${tripType}
    - Accommodation: ${accommodationType}
    - Activities: ${activities.join(', ')}
    - Pace: ${pace}
    - Climate: ${climate}
    - Sustainability Priority: ${sustainability}`
    
  if (specialInstructions) {
    prompt += `\n    - Special Instructions: ${specialInstructions}`
  }
    
  prompt += `

Generate exactly 3 vacation recommendations as a JSON array. Each destination must have this structure:

[
  {
    "destination": "Paris",
    "country": "France",
    "description": "The city of lights offers romance and culture.",
    "estimatedCost": {
      "total": 2500,
      "breakdown": {
        "accommodation": 800,
        "transportation": 600,
        "food": 600,
        "activities": 500
      }
    },
    "highlights": ["Eiffel Tower", "Louvre Museum", "Notre Dame", "Arc de Triomphe", "Seine River"],
    "activities": [
      {
        "name": "Eiffel Tower Visit",
        "description": "Visit the iconic tower",
        "duration": "3 hours",
        "cost": 30,
        "type": "sightseeing"
      }
    ],
    "accommodations": [
      {
        "name": "Hotel Example",
        "type": "Hotel",
        "pricePerNight": 150,
        "amenities": ["WiFi", "Breakfast"],
        "sustainabilityFeatures": ["Energy Efficient", "Recycling"]
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
      "description": "Good public transport system",
      "tips": ["Use metro", "Walk when possible"]
    },
    "weather": {
      "temperature": {"min": 15, "max": 25},
      "conditions": "Mild and pleasant",
      "bestMonths": ["May", "June", "September"]
    },
    "localCuisine": ["Croissants", "Cheese", "Wine"],
    "culturalTips": ["Learn basic French", "Tip is included"],
    "imageUrl": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
  }
]

IMPORTANT: Return ONLY the JSON array with 3 destinations. No text before or after. Budget: ${preferences.budget.currency} ${preferences.budget.min}-${preferences.budget.max}.`
    
  return prompt
}

function parseRecommendations(content: string, preferences: UserPreferences): VacationRecommendation[] {
  try {
    
    // Strip any potential markdown code blocks
    let cleanedContent = content.trim()
    
    // Remove markdown code blocks if present
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
    cleanedContent = cleanedContent.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
    
    // Try to extract JSON array more carefully
    let jsonStr = cleanedContent
    
    // Method 1: Look for array pattern
    const arrayPattern = /\[\s*\{[\s\S]*\}\s*\]/
    const arrayMatch = cleanedContent.match(arrayPattern)
    
    if (arrayMatch) {
      jsonStr = arrayMatch[0]
    } else if (cleanedContent.startsWith('[') && cleanedContent.endsWith(']')) {
      jsonStr = cleanedContent
    } else {
      // Try to find the first [ and last ]
      const firstBracket = cleanedContent.indexOf('[')
      const lastBracket = cleanedContent.lastIndexOf(']')
      
      if (firstBracket >= 0 && lastBracket > firstBracket) {
        jsonStr = cleanedContent.substring(firstBracket, lastBracket + 1)
      } else {
        return getMockRecommendations(preferences)
      }
    }
    
    
    // Basic cleanup - be very conservative
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}') // Remove trailing commas in objects
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/}\s*{/g, '},{') // Add commas between adjacent objects
    
    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (parseError) {
      
      return getMockRecommendations(preferences)
    }
    
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return getMockRecommendations(preferences)
      }
    

    const recommendations: VacationRecommendation[] = parsed.map((item: any, index: number) => ({
      id: (index + 1).toString(),
      destination: item.destination || 'Unknown',
      country: item.country || 'Unknown',
      duration: preferences.duration.days,
      estimatedCost: {
        total: item.estimatedCost?.total || 0,
        breakdown: {
          accommodation: item.estimatedCost?.breakdown?.accommodation || 0,
          transportation: item.estimatedCost?.breakdown?.transportation || 0,
          food: item.estimatedCost?.breakdown?.food || 0,
          activities: item.estimatedCost?.breakdown?.activities || 0,
        }
      },
      description: item.description || '',
      highlights: Array.isArray(item.highlights) ? item.highlights.slice(0, 5) : [],
      activities: Array.isArray(item.activities) ? item.activities.map((act: any) => ({
        name: act.name || '',
        description: act.description || '',
        duration: act.duration || '',
        cost: act.cost || 0,
        type: act.type || 'general',
        sustainabilityRating: act.sustainabilityRating || 7
      })).slice(0, 5) : [],
      accommodations: Array.isArray(item.accommodations) ? item.accommodations.map((acc: any) => ({
        name: acc.name || '',
        type: acc.type || '',
        pricePerNight: acc.pricePerNight || 0,
        amenities: Array.isArray(acc.amenities) ? acc.amenities : [],
        sustainabilityFeatures: Array.isArray(acc.sustainabilityFeatures) ? acc.sustainabilityFeatures : [],
        rating: acc.rating || 4.5
      })).slice(0, 2) : [],
      transportation: Array.isArray(item.transportation) ? item.transportation.map((trans: any) => ({
        mode: trans.mode || '',
        carbonEmissions: trans.carbonEmissions || 0,
        cost: trans.cost || 0,
        duration: trans.duration || ''
      })) : [],
      sustainabilityScore: {
        overall: item.sustainabilityScore?.overall || 7,
        transportation: item.sustainabilityScore?.transportation || 7,
        accommodation: item.sustainabilityScore?.accommodation || 7,
        activities: item.sustainabilityScore?.activities || 7,
        localImpact: item.sustainabilityScore?.localImpact || 7,
        description: item.sustainabilityScore?.description || '',
        tips: Array.isArray(item.sustainabilityScore?.tips) ? item.sustainabilityScore.tips : []
      },
      weather: {
        temperature: {
          min: item.weather?.temperature?.min || 20,
          max: item.weather?.temperature?.max || 30
        },
        conditions: item.weather?.conditions || '',
        bestMonths: Array.isArray(item.weather?.bestMonths) ? item.weather.bestMonths : []
      },
      localCuisine: Array.isArray(item.localCuisine) ? item.localCuisine : [],
      culturalTips: Array.isArray(item.culturalTips) ? item.culturalTips : [],
      images: item.imageUrl ? [item.imageUrl] : []
    }))

    return recommendations // Return all recommendations found
  } catch (error) {
    return getMockRecommendations(preferences)
  }
}

function getMockRecommendations(preferences: UserPreferences): VacationRecommendation[] {
  const mockDestinations = [
    {
      id: '1',
      destination: 'Bali',
      country: 'Indonesia',
      duration: preferences.duration.days,
      estimatedCost: {
        total: Math.floor((preferences.budget.min + preferences.budget.max) / 2),
        breakdown: {
          accommodation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2) * 0.3),
          transportation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2) * 0.25),
          food: Math.floor(((preferences.budget.min + preferences.budget.max) / 2) * 0.25),
          activities: Math.floor(((preferences.budget.min + preferences.budget.max) / 2) * 0.2),
        }
      },
      description: 'Experience the perfect blend of stunning beaches, ancient temples, and lush rice terraces in this tropical paradise. Bali offers world-class surfing, yoga retreats, and vibrant cultural experiences.',
      highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur Sunrise', 'Traditional Markets'],
      activities: [
        { name: 'Surfing Lesson at Canggu', description: 'Learn to surf with professional instructors', duration: '2 hours', cost: 50, type: 'adventure', sustainabilityRating: 9 },
        { name: 'Temple Tour', description: 'Visit ancient Hindu temples', duration: 'Full day', cost: 80, type: 'culture', sustainabilityRating: 8 },
        { name: 'Rice Terrace Trekking', description: 'Hike through stunning landscapes', duration: '3 hours', cost: 30, type: 'nature', sustainabilityRating: 10 },
        { name: 'Cooking Class', description: 'Learn traditional Balinese cuisine', duration: '4 hours', cost: 60, type: 'food', sustainabilityRating: 9 },
        { name: 'Spa Day', description: 'Traditional Balinese massage and treatments', duration: '3 hours', cost: 100, type: 'wellness', sustainabilityRating: 8 }
      ],
      accommodations: [
        { name: 'Eco Bamboo Villa', type: 'Eco-Resort', pricePerNight: 120, amenities: ['Pool', 'Yoga Studio', 'Organic Restaurant'], sustainabilityFeatures: ['Solar Power', 'Rainwater Harvesting', 'Local Materials'], rating: 4.8 },
        { name: 'Beach Front Hotel', type: 'Hotel', pricePerNight: 150, amenities: ['Beach Access', 'Spa', 'Restaurant'], sustainabilityFeatures: ['Plastic-Free', 'Local Sourcing'], rating: 4.5 }
      ],
      transportation: [
        { mode: 'Electric Scooter', carbonEmissions: 5, cost: 20, duration: 'Per day' },
        { mode: 'Private Driver', carbonEmissions: 15, cost: 50, duration: 'Per day' }
      ],
      sustainabilityScore: {
        overall: 8,
        transportation: 7,
        accommodation: 9,
        activities: 8,
        localImpact: 8,
        description: 'Bali offers excellent eco-friendly options with many sustainable accommodations and activities',
        tips: ['Choose eco-certified accommodations', 'Use refillable water bottles', 'Support local businesses', 'Respect sacred sites']
      },
      weather: {
        temperature: { min: 25, max: 32 },
        conditions: 'Tropical with occasional rain',
        bestMonths: ['April', 'May', 'September', 'October']
      },
      localCuisine: ['Nasi Goreng', 'Satay', 'Babi Guling', 'Lawar', 'Bebek Betutu'],
      culturalTips: ['Dress modestly at temples', 'Remove shoes before entering homes', 'Use right hand for greetings'],
      images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80']
    },
    {
      id: '2',
      destination: 'Santorini',
      country: 'Greece',
      duration: preferences.duration.days,
      estimatedCost: {
        total: Math.floor((preferences.budget.min + preferences.budget.max) / 2 * 1.2),
        breakdown: {
          accommodation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.2) * 0.35),
          transportation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.2) * 0.2),
          food: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.2) * 0.25),
          activities: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.2) * 0.2),
        }
      },
      description: 'Discover the iconic white-washed buildings and blue-domed churches perched on dramatic cliffs. Santorini offers breathtaking sunsets, volcanic beaches, and world-class wine.',
      highlights: ['Oia Sunset', 'Red Beach', 'Ancient Akrotiri', 'Wine Tasting', 'Caldera Views'],
      activities: [
        { name: 'Sunset Catamaran Cruise', description: 'Sail around the caldera', duration: '5 hours', cost: 120, type: 'scenic', sustainabilityRating: 7 },
        { name: 'Wine Tour', description: 'Visit local volcanic wineries', duration: '4 hours', cost: 90, type: 'food', sustainabilityRating: 8 },
        { name: 'Hiking Fira to Oia', description: 'Scenic cliff-top trail', duration: '3 hours', cost: 0, type: 'nature', sustainabilityRating: 10 },
        { name: 'Archaeological Tour', description: 'Explore ancient Minoan ruins', duration: 'Half day', cost: 50, type: 'culture', sustainabilityRating: 9 },
        { name: 'Beach Day', description: 'Relax at unique volcanic beaches', duration: 'Full day', cost: 20, type: 'relaxation', sustainabilityRating: 9 }
      ],
      accommodations: [
        { name: 'Cave House Hotel', type: 'Boutique Hotel', pricePerNight: 200, amenities: ['Caldera View', 'Pool', 'Breakfast'], sustainabilityFeatures: ['Traditional Architecture', 'Local Employment'], rating: 4.9 },
        { name: 'Eco Suites', type: 'Eco-Hotel', pricePerNight: 180, amenities: ['Sea View', 'Kitchen', 'Terrace'], sustainabilityFeatures: ['Solar Energy', 'Water Conservation'], rating: 4.7 }
      ],
      transportation: [
        { mode: 'Local Bus', carbonEmissions: 3, cost: 5, duration: 'Per trip' },
        { mode: 'ATV Rental', carbonEmissions: 10, cost: 40, duration: 'Per day' }
      ],
      sustainabilityScore: {
        overall: 7,
        transportation: 6,
        accommodation: 8,
        activities: 7,
        localImpact: 7,
        description: 'Santorini is working towards sustainability with increasing eco-friendly options',
        tips: ['Use public transportation when possible', 'Visit in shoulder season', 'Support local artisans', 'Conserve water']
      },
      weather: {
        temperature: { min: 20, max: 28 },
        conditions: 'Mediterranean climate, dry summers',
        bestMonths: ['May', 'June', 'September', 'October']
      },
      localCuisine: ['Fava', 'Tomatokeftedes', 'Fresh Seafood', 'Greek Salad', 'Baklava'],
      culturalTips: ['Respect photo restrictions at churches', 'Tip is usually included', 'Siesta time 2-5 PM'],
      images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80']
    },
    {
      id: '3',
      destination: 'Kyoto',
      country: 'Japan',
      duration: preferences.duration.days,
      estimatedCost: {
        total: Math.floor((preferences.budget.min + preferences.budget.max) / 2 * 1.1),
        breakdown: {
          accommodation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.1) * 0.3),
          transportation: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.1) * 0.2),
          food: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.1) * 0.3),
          activities: Math.floor(((preferences.budget.min + preferences.budget.max) / 2 * 1.1) * 0.2),
        }
      },
      description: 'Step into Japan\'s cultural heart with thousands of temples, traditional gardens, and geisha districts. Experience the perfect harmony of ancient traditions and modern comfort.',
      highlights: ['Fushimi Inari Shrine', 'Bamboo Grove', 'Golden Pavilion', 'Geisha District', 'Cherry Blossoms'],
      activities: [
        { name: 'Temple & Garden Tour', description: 'Visit iconic temples and zen gardens', duration: 'Full day', cost: 60, type: 'culture', sustainabilityRating: 9 },
        { name: 'Tea Ceremony', description: 'Traditional Japanese tea experience', duration: '2 hours', cost: 50, type: 'culture', sustainabilityRating: 10 },
        { name: 'Bamboo Forest Walk', description: 'Stroll through Arashiyama', duration: '2 hours', cost: 0, type: 'nature', sustainabilityRating: 10 },
        { name: 'Kimono Experience', description: 'Dress in traditional attire', duration: 'Half day', cost: 80, type: 'culture', sustainabilityRating: 8 },
        { name: 'Cooking Workshop', description: 'Learn to make sushi and ramen', duration: '3 hours', cost: 70, type: 'food', sustainabilityRating: 9 }
      ],
      accommodations: [
        { name: 'Traditional Ryokan', type: 'Japanese Inn', pricePerNight: 180, amenities: ['Tatami Rooms', 'Onsen', 'Kaiseki Meals'], sustainabilityFeatures: ['Traditional Methods', 'Local Ingredients'], rating: 4.8 },
        { name: 'Modern Eco Hotel', type: 'Hotel', pricePerNight: 130, amenities: ['City View', 'Restaurant', 'Spa'], sustainabilityFeatures: ['Green Certification', 'Waste Reduction'], rating: 4.6 }
      ],
      transportation: [
        { mode: 'Bicycle', carbonEmissions: 0, cost: 15, duration: 'Per day' },
        { mode: 'Public Transit', carbonEmissions: 2, cost: 10, duration: 'Day pass' }
      ],
      sustainabilityScore: {
        overall: 9,
        transportation: 10,
        accommodation: 8,
        activities: 9,
        localImpact: 9,
        description: 'Kyoto excels in sustainable tourism with excellent public transport and eco-conscious practices',
        tips: ['Use bicycles for short distances', 'Respect temple rules', 'Carry reusable bags', 'Sort waste properly']
      },
      weather: {
        temperature: { min: 15, max: 25 },
        conditions: 'Four distinct seasons',
        bestMonths: ['March', 'April', 'October', 'November']
      },
      localCuisine: ['Kaiseki', 'Tofu Dishes', 'Matcha Sweets', 'Kyo-yasai', 'Soba'],
      culturalTips: ['Remove shoes in temples', 'Bow as greeting', 'No tipping required', 'Quiet on public transport'],
      images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80']
    }
  ]

  // Filter based on climate preference
  let filtered = mockDestinations
  if (preferences.climate !== 'any') {
    // Simple filtering logic - in real app would be more sophisticated
    filtered = mockDestinations.filter(dest => {
      if (preferences.climate === 'tropical' && dest.destination === 'Bali') return true
      if (preferences.climate === 'temperate' && (dest.destination === 'Santorini' || dest.destination === 'Kyoto')) return true
      return false
    })
  }

  // Adjust for sustainability preference
  if (preferences.sustainability === 'high') {
    filtered.forEach(dest => {
      if (dest.sustainabilityScore.overall < 8) {
        dest.sustainabilityScore.overall = Math.min(10, dest.sustainabilityScore.overall + 1)
      }
    })
  }

  return filtered.length > 0 ? filtered : mockDestinations
}