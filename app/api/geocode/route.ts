import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { destination, country } = await request.json()
    
    if (!destination || !country) {
      return NextResponse.json(
        { error: 'Destination and country are required' },
        { status: 400 }
      )
    }

    const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
    
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_secret_token_here') {
      console.warn('Mapbox secret token not configured, returning null coordinates')
      return NextResponse.json({ coordinates: null })
    }

    // Combine destination and country for better geocoding results
    const query = `${destination}, ${country}`
    
    // Use Mapbox Geocoding API
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=place,locality,district`

    const response = await fetch(endpoint)
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return NextResponse.json({ coordinates: null })
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return NextResponse.json({
        coordinates: {
          latitude,
          longitude
        }
      })
    }

    // No results found
    return NextResponse.json({ coordinates: null })
    
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ coordinates: null })
  }
}