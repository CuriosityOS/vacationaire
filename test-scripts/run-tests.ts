#!/usr/bin/env node

import { TestRunner } from './test-runner'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function main() {
  const apiKey = process.env.PERPLEXITY_API_KEY
  const model = process.argv[2] || 'sonar' // Can pass model as argument

  if (!apiKey) {
    console.error('❌ Error: PERPLEXITY_API_KEY not found in environment variables')
    console.error('Please add it to your .env.local file')
    process.exit(1)
  }

  console.log(`\n🚀 Starting Perplexity API Testing Suite`)
  console.log(`📦 Model: ${model}`)
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)

  try {
    const runner = new TestRunner(apiKey, model)
    const summary = await runner.runAllTests()

    // Exit with error code if success rate is below threshold
    if (summary.successRate < 100) {
      console.log(`\n⚠️  Success rate ${summary.successRate.toFixed(1)}% is below 100%`)
      console.log(`💡 Suggestions:`)
      console.log(`   1. Review failed test cases for patterns`)
      console.log(`   2. Adjust prompts in perplexity-client.ts`)
      console.log(`   3. Try different temperature settings`)
      console.log(`   4. Consider switching models`)
      process.exit(1)
    } else {
      console.log(`\n✅ All tests passed! The system is ready for production.`)
      process.exit(0)
    }
  } catch (error) {
    console.error(`\n❌ Fatal error during test execution:`, error)
    process.exit(1)
  }
}

// Run the tests
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})