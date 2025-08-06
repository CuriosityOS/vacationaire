import { UserPreferences } from '@/types'
import { PerplexityClient } from './perplexity-client'
import * as fs from 'fs'
import * as path from 'path'

interface TestCase {
  name: string
  preferences: UserPreferences
}

interface TestRunResult {
  testCase: string
  success: boolean
  attempts: number
  error?: string
  responseLength?: number
  validDestinations?: number
}

interface TestSummary {
  totalTests: number
  successfulTests: number
  failedTests: number
  successRate: number
  averageAttempts: number
  results: TestRunResult[]
  timestamp: string
  model: string
}

export class TestRunner {
  private client: PerplexityClient
  private testCases: TestCase[]
  private results: TestRunResult[] = []

  constructor(apiKey: string, model: string = 'sonar') {
    this.client = new PerplexityClient(apiKey, model, 3, true)
    this.testCases = this.generateTestCases()
  }

  /**
   * Generate diverse test cases
   */
  private generateTestCases(): TestCase[] {
    const testCases: TestCase[] = []

    // Budget variations
    const budgets = [
      { min: 500, max: 1000, currency: 'USD' as const, name: 'Low Budget' },
      { min: 2000, max: 5000, currency: 'USD' as const, name: 'Medium Budget' },
      { min: 5000, max: 10000, currency: 'USD' as const, name: 'High Budget' },
    ]

    // Duration variations
    const durations = [
      { days: 3, flexibility: 'exact' as const, name: 'Weekend Trip' },
      { days: 7, flexibility: 'flexible' as const, name: 'Week Vacation' },
      { days: 14, flexibility: 'very_flexible' as const, name: 'Two Week Journey' },
    ]

    // Trip type variations
    const tripTypes: Array<UserPreferences['tripType']> = ['adventure', 'relaxation', 'culture', 'romantic', 'family']

    // Climate preferences
    const climates: Array<UserPreferences['climate']> = ['tropical', 'temperate', 'cold', 'any']

    // Create combinations
    let caseId = 1
    for (const budget of budgets) {
      for (const duration of durations) {
        for (const tripType of tripTypes) {
          for (const climate of climates) {
            // Skip some combinations to keep test set manageable
            if (caseId > 10) break

            const testCase: TestCase = {
              name: `Test ${caseId}: ${budget.name} - ${duration.name} - ${tripType} - ${climate}`,
              preferences: {
                budget: {
                  min: budget.min,
                  max: budget.max,
                  currency: budget.currency
                },
                duration: {
                  days: duration.days,
                  flexibility: duration.flexibility
                },
                tripType,
                accommodationType: tripType === 'family' ? 'resort' : 'hotel',
                activities: this.getActivitiesForTripType(tripType),
                pace: tripType === 'relaxation' ? 'slow' : 'moderate',
                climate,
                sustainability: tripType === 'culture' ? 'high' : 'medium',
                specialInstructions: ''
              }
            }

            testCases.push(testCase)
            caseId++
          }
          if (caseId > 10) break
        }
        if (caseId > 10) break
      }
      if (caseId > 10) break
    }

    return testCases
  }

  private getActivitiesForTripType(tripType: UserPreferences['tripType']): string[] {
    const activityMap = {
      adventure: ['hiking', 'water sports', 'climbing', 'zip-lining', 'wildlife'],
      relaxation: ['spa', 'beach', 'yoga', 'meditation', 'reading'],
      culture: ['museums', 'historical sites', 'local cuisine', 'art galleries', 'festivals'],
      romantic: ['fine dining', 'sunset viewing', 'couples spa', 'wine tasting', 'scenic walks'],
      family: ['theme parks', 'beaches', 'zoos', 'interactive museums', 'water parks'],
      business: ['conferences', 'networking', 'coworking spaces', 'business dining', 'airport lounges'],
      solo: ['photography', 'journaling', 'local markets', 'walking tours', 'cafes'],
      group: ['group tours', 'team activities', 'shared dining', 'party venues', 'group sports']
    }

    return activityMap[tripType] || ['sightseeing', 'dining', 'shopping', 'relaxation', 'exploration']
  }

  /**
   * Run a single test case
   */
  private async runTest(testCase: TestCase): Promise<TestRunResult> {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Running: ${testCase.name}`)
    console.log(`${'='.repeat(60)}`)

    const result = await this.client.generateRecommendations(testCase.preferences)

    const testResult: TestRunResult = {
      testCase: testCase.name,
      success: result.success,
      attempts: result.attempts,
      error: result.error,
      responseLength: result.rawResponse?.length,
      validDestinations: result.data?.length
    }

    if (result.success) {
      console.log(`✅ SUCCESS after ${result.attempts} attempt(s)`)
      console.log(`   Generated ${result.data?.length} destinations`)
      result.data?.forEach((dest, i) => {
        console.log(`   ${i + 1}. ${dest.destination}, ${dest.country} - $${dest.estimatedCost.total}`)
      })
    } else {
      console.log(`❌ FAILED after ${result.attempts} attempts`)
      console.log(`   Error: ${result.error}`)
      if (result.sanitizedResponse) {
        console.log(`   Sanitized response preview: ${result.sanitizedResponse.substring(0, 200)}...`)
      }
    }

    return testResult
  }

  /**
   * Run all test cases
   */
  async runAllTests(): Promise<TestSummary> {
    console.log(`\n${'#'.repeat(60)}`)
    console.log(`Starting Test Suite with ${this.testCases.length} test cases`)
    console.log(`Model: ${this.client['model']}`)
    console.log(`${'#'.repeat(60)}`)

    this.results = []

    for (const testCase of this.testCases) {
      const result = await this.runTest(testCase)
      this.results.push(result)
      
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const summary = this.generateSummary()
    this.printSummary(summary)
    this.saveSummary(summary)

    return summary
  }

  /**
   * Generate test summary
   */
  private generateSummary(): TestSummary {
    const successfulTests = this.results.filter(r => r.success).length
    const totalAttempts = this.results.reduce((sum, r) => sum + r.attempts, 0)

    return {
      totalTests: this.results.length,
      successfulTests,
      failedTests: this.results.length - successfulTests,
      successRate: (successfulTests / this.results.length) * 100,
      averageAttempts: totalAttempts / this.results.length,
      results: this.results,
      timestamp: new Date().toISOString(),
      model: this.client['model']
    }
  }

  /**
   * Print summary to console
   */
  private printSummary(summary: TestSummary) {
    console.log(`\n${'#'.repeat(60)}`)
    console.log(`TEST SUITE SUMMARY`)
    console.log(`${'#'.repeat(60)}`)
    console.log(`Total Tests: ${summary.totalTests}`)
    console.log(`Successful: ${summary.successfulTests} (${summary.successRate.toFixed(1)}%)`)
    console.log(`Failed: ${summary.failedTests}`)
    console.log(`Average Attempts: ${summary.averageAttempts.toFixed(2)}`)
    console.log(`Model Used: ${summary.model}`)
    
    if (summary.failedTests > 0) {
      console.log(`\nFailed Tests:`)
      summary.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.testCase}`)
          console.log(`    Error: ${r.error}`)
        })
    }

    console.log(`\n${'='.repeat(60)}`)
    if (summary.successRate === 100) {
      console.log(`🎉 PERFECT SCORE! All tests passed!`)
    } else if (summary.successRate >= 90) {
      console.log(`✅ EXCELLENT! ${summary.successRate.toFixed(1)}% success rate`)
    } else if (summary.successRate >= 70) {
      console.log(`⚠️  GOOD BUT NEEDS IMPROVEMENT: ${summary.successRate.toFixed(1)}% success rate`)
    } else {
      console.log(`❌ NEEDS SIGNIFICANT IMPROVEMENT: ${summary.successRate.toFixed(1)}% success rate`)
    }
    console.log(`${'='.repeat(60)}\n`)
  }

  /**
   * Save summary to file
   */
  private saveSummary(summary: TestSummary) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `test-results-${timestamp}.json`
    const filepath = path.join(__dirname, 'results', filename)

    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, 'results')
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    }

    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2))
    console.log(`Results saved to: ${filepath}`)
  }
}