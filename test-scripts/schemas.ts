import { z } from 'zod'

// Define the exact schema for a single vacation recommendation
export const VacationRecommendationSchema = z.object({
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
  highlights: z.array(z.string()).min(3).max(10),
  activities: z.array(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    duration: z.string().min(1),
    cost: z.number().min(0),
    type: z.string().min(1)
  })).min(1).max(10),
  accommodations: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    pricePerNight: z.number().min(0),
    amenities: z.array(z.string()),
    sustainabilityFeatures: z.array(z.string())
  })).min(1).max(5),
  transportation: z.array(z.object({
    mode: z.string().min(1),
    carbonEmissions: z.number().min(0),
    cost: z.number().min(0),
    duration: z.string().min(1)
  })).min(1).max(5),
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
    bestMonths: z.array(z.string()).min(1).max(12)
  }),
  localCuisine: z.array(z.string()).min(1).max(10),
  culturalTips: z.array(z.string()).min(1).max(10),
  imageUrl: z.string().url().optional()
})

// Schema for the full API response (array of recommendations)
export const VacationRecommendationsArraySchema = z.array(VacationRecommendationSchema).min(10).max(10)

// Type exports
export type VacationRecommendation = z.infer<typeof VacationRecommendationSchema>
export type VacationRecommendationsArray = z.infer<typeof VacationRecommendationsArraySchema>