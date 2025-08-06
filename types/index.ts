export interface UserPreferences {
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: {
    days: number;
    flexibility: 'exact' | 'flexible' | 'minimum';
  };
  travelDates: {
    startDate: string;
    endDate?: string;
    flexibility: 'exact' | 'flexible';
  };
  tripType: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  accommodationType: 'hotel' | 'resort' | 'airbnb' | 'hostel' | 'camping' | 'luxury';
  activities: string[];
  interests: string[];
  pace: 'relaxed' | 'moderate' | 'fast-paced';
  climate: 'tropical' | 'temperate' | 'cold' | 'dry' | 'any';
  destinations: {
    preferred: string[];
    avoid: string[];
  };
  transportation: 'flight' | 'train' | 'car' | 'bus' | 'any';
  dietary: string[];
  accessibility: string[];
  sustainability: 'high' | 'medium' | 'low';
  specialInstructions?: string;
}

export interface VacationRecommendation {
  id: string;
  destination: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  duration: number;
  estimatedCost: {
    total: number;
    breakdown: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
    };
  };
  description: string;
  highlights: string[];
  activities: Activity[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  sustainabilityScore: SustainabilityScore;
  weather: Weather;
  localCuisine: string[];
  culturalTips: string[];
  images: string[];
}

export interface Activity {
  name: string;
  description: string;
  duration: string;
  cost: number;
  type: string;
  sustainabilityRating: number;
}

export interface Accommodation {
  name: string;
  type: string;
  pricePerNight: number;
  amenities: string[];
  sustainabilityFeatures: string[];
  rating: number;
}

export interface Transportation {
  mode: string;
  carbonEmissions: number;
  cost: number;
  duration: string;
}

export interface SustainabilityScore {
  overall: number;
  transportation: number;
  accommodation: number;
  activities: number;
  localImpact: number;
  description: string;
  tips: string[];
}

export interface Weather {
  temperature: {
    min: number;
    max: number;
  };
  conditions: string;
  bestMonths: string[];
}