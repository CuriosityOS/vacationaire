'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface DestinationMapProps {
  latitude: number
  longitude: number
  zoom?: number
  width?: number
  height?: number
  destinationName: string
  className?: string
}

const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function DestinationMap({
  latitude,
  longitude,
  zoom = 10,
  width = 400,
  height = 256,
  destinationName,
  className = ''
}: DestinationMapProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Check if we have a valid token
  if (!MAPBOX_PUBLIC_TOKEN || MAPBOX_PUBLIC_TOKEN === 'your_mapbox_public_token_here') {
    console.warn('Mapbox public token is not configured')
    return <MapFallback destinationName={destinationName} />
  }

  // Handle invalid coordinates
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return <MapFallback destinationName={destinationName} />
  }

  // Show fallback if image failed to load
  if (imageError) {
    return <MapFallback destinationName={destinationName} />
  }

  // Construct the Mapbox Static Image URL
  // Using 'streets-v12' style with a marker at the destination
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l-marker+EA580C(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}@2x?access_token=${MAPBOX_PUBLIC_TOKEN}`

  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
          <MapPin className="w-20 h-20 text-beige-500 opacity-60 mb-2 animate-pulse" />
          <p className="text-beige-600 text-sm font-medium opacity-80">Loading map...</p>
        </div>
      )}
      <Image
        src={mapUrl}
        alt={`Map of ${destinationName}`}
        fill
        className={`object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
        unoptimized
        priority={false}
      />
    </>
  )
}

// Fallback component when map cannot be displayed
function MapFallback({ destinationName }: { destinationName: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
      <MapPin className="w-20 h-20 text-beige-500 opacity-60 mb-2" />
      <p className="text-beige-600 text-sm font-medium opacity-80">
        Explore {destinationName}
      </p>
      <p className="text-beige-500 text-xs mt-1 opacity-70">Map view unavailable</p>
    </div>
  )
}