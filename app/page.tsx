'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import Questionnaire from '@/components/Questionnaire'
import Results from '@/components/Results'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { UserPreferences, VacationRecommendation } from '@/types'
import { generateVacationRecommendations } from '@/lib/perplexity'

type AppState = 'hero' | 'questionnaire' | 'loading' | 'results' | 'error'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('hero')
  const [recommendations, setRecommendations] = useState<VacationRecommendation[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [lastPreferences, setLastPreferences] = useState<UserPreferences | null>(null)

  const handleStart = () => {
    setAppState('questionnaire')
  }

  const handleQuestionnaireComplete = async (preferences: UserPreferences) => {
    setAppState('loading')
    setLastPreferences(preferences)
    
    try {
      const recs = await generateVacationRecommendations(preferences)
      setRecommendations(recs)
      setAppState('results')
    } catch (error: any) {
      console.error('Error getting recommendations:', error)
      setErrorMessage(error.message || 'Failed to generate recommendations')
      setAppState('error')
    }
  }

  const handleRetry = async () => {
    if (lastPreferences) {
      await handleQuestionnaireComplete(lastPreferences)
    } else {
      setAppState('questionnaire')
    }
  }

  const handleRestart = () => {
    setAppState('hero')
    setRecommendations([])
    setErrorMessage('')
    setLastPreferences(null)
  }

  return (
    <main className="min-h-screen bg-warm-white">
      {appState === 'hero' && <Hero onStart={handleStart} />}
      {appState === 'questionnaire' && <Questionnaire onComplete={handleQuestionnaireComplete} />}
      {appState === 'loading' && <Loading />}
      {appState === 'results' && <Results recommendations={recommendations} onRestart={handleRestart} />}
      {appState === 'error' && <Error message={errorMessage} onRetry={handleRetry} />}
    </main>
  )
}