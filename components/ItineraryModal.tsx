'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, DollarSign, Thermometer, Home, Plane, Coffee, Camera, Leaf, Star, Clock, Users } from 'lucide-react'
import { VacationRecommendation } from '@/types'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import DestinationMap from './DestinationMap'

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: VacationRecommendation | null;
}

// Helper function to group activities by day
function groupActivitiesByDay(activities: any[], totalDays: number) {
  const days = [];
  const activitiesPerDay = Math.ceil(activities.length / totalDays);
  
  for (let i = 0; i < totalDays; i++) {
    const dayActivities = activities.slice(i * activitiesPerDay, (i + 1) * activitiesPerDay);
    if (dayActivities.length > 0) {
      days.push({
        day: i + 1,
        activities: dayActivities
      });
    }
  }
  
  return days;
}

export default function ItineraryModal({ isOpen, onClose, recommendation }: ItineraryModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'accommodation' | 'transport' | 'tips'>('overview');
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!recommendation) return null;

  const dailyItinerary = groupActivitiesByDay(recommendation.activities, recommendation.duration);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-sand-200 via-beige-200 to-orange-100">
              {recommendation.coordinates ? (
                <DestinationMap
                  latitude={recommendation.coordinates.latitude}
                  longitude={recommendation.coordinates.longitude}
                  destinationName={recommendation.destination}
                  zoom={10}
                />
              ) : recommendation.images?.[0] ? (
                <Image
                  src={recommendation.images[0]}
                  alt={recommendation.destination}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MapPin className="w-20 h-20 text-beige-500 opacity-60" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-beige-800/80 via-beige-800/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{recommendation.destination}</h2>
                <p className="text-xl drop-shadow">{recommendation.country}</p>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">{recommendation.duration} days</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="text-sm">${recommendation.estimatedCost.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-beige-800" />
              </button>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex border-b border-beige-200 px-6 bg-beige-50">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-beige-600 hover:text-beige-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'daily' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-beige-600 hover:text-beige-800'
                }`}
              >
                Daily Itinerary
              </button>
              <button
                onClick={() => setActiveTab('accommodation')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'accommodation' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-beige-600 hover:text-beige-800'
                }`}
              >
                Accommodation
              </button>
              <button
                onClick={() => setActiveTab('transport')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transport' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-beige-600 hover:text-beige-800'
                }`}
              >
                Transport
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'tips' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-beige-600 hover:text-beige-800'
                }`}
              >
                Tips & Info
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Trip Overview</h3>
                    <p className="text-beige-600">{recommendation.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Highlights</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.highlights.map((highlight, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-beige-800 mb-3">Cost Breakdown</h3>
                      <div className="bg-beige-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-beige-600">Accommodation</span>
                          <span className="font-medium">${recommendation.estimatedCost.breakdown.accommodation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige-600">Transportation</span>
                          <span className="font-medium">${recommendation.estimatedCost.breakdown.transportation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige-600">Food</span>
                          <span className="font-medium">${recommendation.estimatedCost.breakdown.food.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-beige-600">Activities</span>
                          <span className="font-medium">${recommendation.estimatedCost.breakdown.activities.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-beige-200">
                          <span className="font-semibold text-beige-800">Total</span>
                          <span className="font-bold text-orange-600">${recommendation.estimatedCost.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-beige-800 mb-3">Weather</h3>
                      <div className="bg-beige-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Thermometer className="w-5 h-5 text-orange-500 mr-2" />
                          <span className="text-beige-800 font-medium">
                            {recommendation.weather.temperature.min}°C - {recommendation.weather.temperature.max}°C
                          </span>
                        </div>
                        <p className="text-beige-600 mb-2">{recommendation.weather.conditions}</p>
                        <p className="text-sm text-beige-500">
                          Best months: {recommendation.weather.bestMonths.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Sustainability Score</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Leaf className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-lg font-medium text-green-700">
                          Overall Score: {recommendation.sustainabilityScore.overall}/100
                        </span>
                      </div>
                      <p className="text-beige-600 mb-3">{recommendation.sustainabilityScore.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-beige-500">Transport:</span>
                          <span className="ml-1 font-medium">{recommendation.sustainabilityScore.transportation}/100</span>
                        </div>
                        <div>
                          <span className="text-beige-500">Accommodation:</span>
                          <span className="ml-1 font-medium">{recommendation.sustainabilityScore.accommodation}/100</span>
                        </div>
                        <div>
                          <span className="text-beige-500">Activities:</span>
                          <span className="ml-1 font-medium">{recommendation.sustainabilityScore.activities}/100</span>
                        </div>
                        <div>
                          <span className="text-beige-500">Local Impact:</span>
                          <span className="ml-1 font-medium">{recommendation.sustainabilityScore.localImpact}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Daily Itinerary Tab */}
              {activeTab === 'daily' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-beige-800">Day-by-Day Itinerary</h3>
                  {dailyItinerary.map((day) => (
                    <div key={day.day} className="border-l-4 border-orange-400 pl-4">
                      <h4 className="text-lg font-semibold text-beige-800 mb-3">Day {day.day}</h4>
                      <div className="space-y-3">
                        {day.activities.map((activity, i) => (
                          <div key={i} className="bg-beige-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <Camera className="w-4 h-4 text-orange-500 mr-2" />
                                  <h5 className="font-medium text-beige-800">{activity.name}</h5>
                                </div>
                                <p className="text-sm text-beige-600 mb-2">{activity.description}</p>
                                <div className="flex gap-4 text-xs text-beige-500">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.duration}
                                  </span>
                                  <span className="flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    ${activity.cost}
                                  </span>
                                  <span className="px-2 py-0.5 bg-beige-200 rounded">
                                    {activity.type}
                                  </span>
                                  {activity.sustainabilityRating > 7 && (
                                    <span className="flex items-center text-green-600">
                                      <Leaf className="w-3 h-3 mr-1" />
                                      Eco-friendly
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Accommodation Tab */}
              {activeTab === 'accommodation' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-beige-800">Accommodation Options</h3>
                  {recommendation.accommodations.map((accommodation, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center">
                            <Home className="w-5 h-5 text-orange-500 mr-2" />
                            <h4 className="font-semibold text-beige-800">{accommodation.name}</h4>
                          </div>
                          <p className="text-sm text-beige-600 mt-1">{accommodation.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">${accommodation.pricePerNight}/night</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-beige-600 ml-1">{accommodation.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-beige-700 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {accommodation.amenities.map((amenity, j) => (
                            <span key={j} className="px-2 py-1 bg-beige-100 text-beige-600 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {accommodation.sustainabilityFeatures.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-green-700 mb-2">Sustainability Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {accommodation.sustainabilityFeatures.map((feature, j) => (
                              <span key={j} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Transport Tab */}
              {activeTab === 'transport' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-beige-800">Transportation Options</h3>
                  {recommendation.transportation.map((transport, i) => (
                    <div key={i} className="bg-beige-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Plane className="w-5 h-5 text-orange-500 mr-2" />
                          <div>
                            <h4 className="font-medium text-beige-800">{transport.mode}</h4>
                            <p className="text-sm text-beige-600">Duration: {transport.duration}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">${transport.cost}</p>
                          <p className="text-xs text-beige-500">
                            {transport.carbonEmissions}kg CO₂
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Tips & Info Tab */}
              {activeTab === 'tips' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Local Cuisine</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.localCuisine.map((cuisine, i) => (
                        <span key={i} className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          <Coffee className="w-3 h-3 mr-1" />
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Cultural Tips</h3>
                    <ul className="space-y-2">
                      {recommendation.culturalTips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-orange-500 mr-2 mt-0.5">•</span>
                          <span className="text-beige-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-beige-800 mb-3">Sustainability Tips</h3>
                    <ul className="space-y-2">
                      {recommendation.sustainabilityScore.tips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <Leaf className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-beige-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}