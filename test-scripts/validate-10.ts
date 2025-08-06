#!/usr/bin/env tsx

import { PerplexityClient } from './perplexity-client'
import { UserPreferences } from '@/types'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

interface TestResult {
  testNumber: number
  success: boolean
  attempts: number
  destinations?: number
}

async function validate10Responses() {
  const apiKey = process.env.PERPLEXITY_API_KEY
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not found')
    process.exit(1)
  }

  console.log('🚀 Validating 10 responses with sonar model')
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)
  console.log('='.repeat(60))
  
  const client = new PerplexityClient(apiKey, 'sonar', 3, false) // Less verbose
  const results: TestResult[] = []
  
  // Create 10 different test cases
  for (let i = 1; i <= 10; i++) {
    const testPreferences: UserPreferences = {
      budget: {
        min: 1000 + (i * 500),
        max: 3000 + (i * 500),
        currency: 'USD'
      },
      duration: {
        days: 3 + (i % 3) * 2,
        flexibility: i % 2 === 0 ? 'flexible' : 'exact'
      },
      tripType: (['adventure', 'relaxation', 'culture', 'romantic', 'family'] as const)[i % 5],
      accommodationType: i % 2 === 0 ? 'hotel' : 'resort',
      activities: getActivitiesForTest(i),
      pace: i % 3 === 0 ? 'slow' : i % 3 === 1 ? 'moderate' : 'fast',
      climate: (['tropical', 'temperate', 'cold', 'any'] as const)[i % 4],
      sustainability: i % 2 === 0 ? 'high' : 'medium',
      specialInstructions: ''
    }
    
    process.stdout.write(`Test ${i}/10: `)
    
    const result = await client.generateRecommendations(testPreferences)
    
    const testResult: TestResult = {
      testNumber: i,
      success: result.success,
      attempts: result.attempts,
      destinations: result.data?.length
    }
    
    results.push(testResult)
    
    if (result.success) {
      console.log(`✅ Pass (${result.attempts} attempt${result.attempts > 1 ? 's' : ''}, ${result.data?.length} destinations)`)
    } else {
      console.log(`❌ Fail after ${result.attempts} attempts`)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 VALIDATION SUMMARY')
  console.log('='.repeat(60))
  
  const successCount = results.filter(r => r.success).length
  const successRate = (successCount / 10) * 100
  const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length
  
  console.log(`Total Tests: 10`)
  console.log(`Successful: ${successCount}/10 (${successRate}%)`)
  console.log(`Failed: ${10 - successCount}/10`)
  console.log(`Average Attempts: ${avgAttempts.toFixed(1)}`)
  
  if (successCount === 10) {
    console.log('\n🎉 PERFECT SCORE! 10/10 tests passed!')
    console.log('✅ The system is ready for production use.')
  } else if (successCount >= 9) {
    console.log(`\n✅ EXCELLENT! ${successCount}/10 tests passed.`)
    console.log('The system is highly reliable.')
  } else if (successCount >= 7) {
    console.log(`\n⚠️  GOOD: ${successCount}/10 tests passed.`)
    console.log('Consider minor adjustments to improve reliability.')
  } else {
    console.log(`\n❌ NEEDS IMPROVEMENT: Only ${successCount}/10 tests passed.`)
    console.log('Review the prompting strategy and error handling.')
  }
  
  // Show failed tests
  if (successCount < 10) {
    console.log('\nFailed Tests:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - Test ${r.testNumber}`)
    })
  }
  
  console.log('\n' + '='.repeat(60))
  
  process.exit(successCount === 10 ? 0 : 1)
}

function getActivitiesForTest(testNumber: number): string[] {
  const allActivities = [
    ['hiking', 'water sports', 'wildlife', 'photography', 'local cuisine'],
    ['spa', 'beach', 'yoga', 'meditation', 'reading'],
    ['museums', 'historical sites', 'local cuisine', 'art galleries', 'festivals'],
    ['fine dining', 'sunset viewing', 'couples spa', 'wine tasting', 'scenic walks'],
    ['theme parks', 'beaches', 'zoos', 'interactive museums', 'water parks']
  ]
  
  return allActivities[testNumber % allActivities.length]
}

// Run validation
validate10Responses().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})