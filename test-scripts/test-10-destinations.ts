#!/usr/bin/env tsx

import { PerplexityClient } from './perplexity-client'
import { UserPreferences } from '@/types'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function test10Destinations() {
  const apiKey = process.env.PERPLEXITY_API_KEY
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not found')
    process.exit(1)
  }

  console.log('🚀 Testing 10 destinations generation with sonar model')
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)
  console.log('='.repeat(60))
  
  const client = new PerplexityClient(apiKey, 'sonar', 1, true) // Single attempt for faster testing
  
  const testPreferences: UserPreferences = {
    budget: {
      min: 3000,
      max: 6000,
      currency: 'USD'
    },
    duration: {
      days: 10,
      flexibility: 'flexible'
    },
    tripType: 'friends',
    accommodationType: 'hotel',
    activities: ['hiking', 'water sports', 'wildlife', 'photography', 'local cuisine'],
    pace: 'moderate',
    climate: 'any',
    sustainability: 'high',
    specialInstructions: 'Looking for diverse destinations with unique experiences'
  }
  
  console.log('📋 Test preferences:')
  console.log(`  Budget: $${testPreferences.budget.min}-${testPreferences.budget.max}`)
  console.log(`  Duration: ${testPreferences.duration.days} days`)
  console.log(`  Type: ${testPreferences.tripType}`)
  console.log(`  Sustainability: ${testPreferences.sustainability}`)
  
  console.log('\n🔄 Requesting 10 destinations from Perplexity API...')
  
  const result = await client.generateRecommendations(testPreferences)
  
  if (result.success) {
    console.log(`\n✅ SUCCESS after ${result.attempts} attempt(s)!`)
    console.log(`\n📍 Generated ${result.data?.length} destinations:`)
    console.log('='.repeat(60))
    
    result.data?.forEach((dest, i) => {
      console.log(`\n${i + 1}. ${dest.destination}, ${dest.country}`)
      console.log(`   💰 Cost: $${dest.estimatedCost.total}`)
      console.log(`   📝 ${dest.description.substring(0, 80)}...`)
      console.log(`   🌟 Highlights: ${dest.highlights.slice(0, 3).join(', ')}`)
      console.log(`   🌱 Sustainability: ${dest.sustainabilityScore.overall}/10`)
      console.log(`   🌡️  Weather: ${dest.weather.temperature.min}°-${dest.weather.temperature.max}°C`)
      console.log(`   🍽️  Cuisine: ${dest.localCuisine.slice(0, 3).join(', ')}`)
    })
    
    console.log('\n' + '='.repeat(60))
    
    if (result.data?.length === 10) {
      console.log('🎉 Perfect! Successfully generated exactly 10 destinations!')
    } else {
      console.log(`⚠️  Generated ${result.data?.length} destinations instead of 10`)
    }
  } else {
    console.log(`\n❌ FAILED after ${result.attempts} attempts`)
    console.log(`   Error: ${result.error}`)
    
    if (result.rawResponse) {
      console.log(`\n📄 Raw response preview (first 500 chars):`)
      console.log(result.rawResponse.substring(0, 500))
    }
  }
  
  process.exit(result.success && result.data?.length === 10 ? 0 : 1)
}

// Run the test
test10Destinations().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})