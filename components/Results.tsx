'use client'

import { motion } from 'framer-motion'
import { MapPin, Calendar, DollarSign, Users, Thermometer, Camera, Coffee, Plane, Home, Star, RefreshCw } from 'lucide-react'
import { VacationRecommendation } from '@/types'
import SustainabilityBadge from './SustainabilityBadge'
import DestinationMap from './DestinationMap'
import ItineraryModal from './ItineraryModal'
import Image from 'next/image'
import { useState } from 'react'

interface ResultsProps {
  recommendations: VacationRecommendation[];
  onRestart: () => void;
}

// Component to display either a map or image for the destination
function DestinationVisual({ rec }: { rec: VacationRecommendation }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // If we have coordinates, show the map
  if (rec.coordinates) {
    return (
      <DestinationMap
        latitude={rec.coordinates.latitude}
        longitude={rec.coordinates.longitude}
        destinationName={rec.destination}
        zoom={11}
      />
    );
  }
  
  // Otherwise, fall back to the image if available
  const imageUrl = rec.images?.[0];
  
  // Show placeholder if no URL or if image failed to load
  if (!imageUrl || imageError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
        <MapPin className="w-20 h-20 text-beige-500 opacity-60 mb-2" />
        <p className="text-beige-600 text-sm font-medium opacity-80">Explore {rec.destination}</p>
      </div>
    );
  }
  
  return (
    <>
      {imageLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
          <MapPin className="w-20 h-20 text-beige-500 opacity-60 mb-2 animate-pulse" />
          <p className="text-beige-600 text-sm font-medium opacity-80">Loading...</p>
        </div>
      )}
      <Image 
        src={imageUrl} 
        alt={`${rec.destination}, ${rec.country}`}
        fill
        className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        unoptimized
        priority={false}
      />
    </>
  );
}

export default function Results({ recommendations, onRestart }: ResultsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<VacationRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewItinerary = (recommendation: VacationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay before clearing the recommendation to allow exit animation
    setTimeout(() => setSelectedRecommendation(null), 300);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-beige-800 mb-4">
            Your Perfect Vacation Awaits
          </h1>
          <p className="text-xl text-beige-600 font-body">
            Based on your preferences, we&apos;ve found {recommendations.length} amazing destinations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 -mx-6 -mt-6 mb-6 rounded-t-2xl overflow-hidden bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
                <DestinationVisual rec={rec} />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-beige-800/80 via-beige-800/40 to-transparent">
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">{rec.destination}</h2>
                  <p className="text-lg text-white/90 drop-shadow">{rec.country}</p>
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center text-beige-700 mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{rec.duration} days</span>
                  </div>
                  <div className="flex items-center text-beige-700">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="font-semibold">${rec.estimatedCost.total.toLocaleString()}</span>
                  </div>
                </div>
                <SustainabilityBadge score={rec.sustainabilityScore.overall} />
              </div>

              <p className="text-beige-600 mb-4 font-body">{rec.description}</p>

              <div className="mb-4">
                <h4 className="font-semibold text-beige-800 mb-2">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {rec.highlights.map((highlight, i) => (
                    <span key={i} className="px-3 py-1 bg-beige-100 text-beige-700 rounded-full text-sm">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-beige-50 p-3 rounded-lg">
                  <div className="flex items-center text-beige-700 mb-1">
                    <Thermometer className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Weather</span>
                  </div>
                  <p className="text-sm text-beige-600">
                    {rec.weather.temperature.min}°-{rec.weather.temperature.max}°C
                  </p>
                  <p className="text-xs text-beige-500">{rec.weather.conditions}</p>
                </div>
                <div className="bg-beige-50 p-3 rounded-lg">
                  <div className="flex items-center text-beige-700 mb-1">
                    <Home className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Accommodation</span>
                  </div>
                  <p className="text-sm text-beige-600">
                    {rec.accommodations[0]?.type || 'Various options'}
                  </p>
                  <p className="text-xs text-beige-500">
                    From ${rec.accommodations[0]?.pricePerNight || 'N/A'}/night
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-beige-800 mb-2">Top Activities</h4>
                <div className="space-y-2">
                  {rec.activities.slice(0, 3).map((activity, i) => (
                    <div key={i} className="flex items-start">
                      <Camera className="w-4 h-4 text-beige-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-beige-700 font-medium">{activity.name}</p>
                        <p className="text-xs text-beige-500">{activity.duration} • ${activity.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-beige-800 mb-2">Sustainability Tips</h4>
                <ul className="space-y-1">
                  {rec.sustainabilityScore.tips.slice(0, 2).map((tip, i) => (
                    <li key={i} className="text-sm text-beige-600 flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary"
                onClick={() => handleViewItinerary(rec)}
              >
                View Full Itinerary
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <button
            onClick={onRestart}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-beige-200 text-beige-700 rounded-full hover:bg-beige-300 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Plan Another Trip</span>
          </button>
        </motion.div>
      </div>

      {/* Itinerary Modal */}
      <ItineraryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        recommendation={selectedRecommendation}
      />
    </div>
  )
}