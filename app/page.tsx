'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Questionnaire from '@/components/Questionnaire'
import Results from '@/components/Results'
import Loading from '@/components/Loading'
import { UserPreferences, VacationRecommendation } from '@/types'
import { generateVacationRecommendations } from '@/lib/perplexity'

type AppState = 'hero' | 'questionnaire' | 'loading' | 'results'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('hero')
  const [recommendations, setRecommendations] = useState<VacationRecommendation[]>([])

  const handleStart = () => {
    setAppState('questionnaire')
  }

  const handleQuestionnaireComplete = async (preferences: UserPreferences) => {
    setAppState('loading')
    
    try {
      const recs = await generateVacationRecommendations(preferences)
      setRecommendations(recs)
      setAppState('results')
    } catch (error) {
      console.error('Error getting recommendations:', error)
      // Still show results with mock data
      setAppState('results')
    }
  }

  const handleRestart = () => {
    setAppState('hero')
    setRecommendations([])
  }

  return (
    <main className="min-h-screen bg-warm-white">
      {appState === 'hero' && <Hero onStart={handleStart} />}
      {appState === 'questionnaire' && <Questionnaire onComplete={handleQuestionnaireComplete} />}
      {appState === 'loading' && <Loading />}
      {appState === 'results' && <Results recommendations={recommendations} onRestart={handleRestart} />}
    </main>
  )
}