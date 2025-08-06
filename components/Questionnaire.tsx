'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, DollarSign, Calendar, Users, Home, Heart, Zap, Cloud, Plane, Utensils, Leaf, MessageSquare } from 'lucide-react'
import { UserPreferences } from '@/types'

interface QuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
}

const questions = [
  {
    id: 'budget',
    title: "What's your budget?",
    icon: DollarSign,
    type: 'budget'
  },
  {
    id: 'duration',
    title: "How long is your trip?",
    icon: Calendar,
    type: 'duration'
  },
  {
    id: 'tripType',
    title: "Who are you traveling with?",
    icon: Users,
    type: 'single-choice',
    options: [
      { value: 'solo', label: 'Solo Adventure' },
      { value: 'couple', label: 'Romantic Getaway' },
      { value: 'family', label: 'Family Trip' },
      { value: 'friends', label: 'Friends Trip' },
      { value: 'business', label: 'Business Travel' }
    ]
  },
  {
    id: 'accommodationType',
    title: "Where would you like to stay?",
    icon: Home,
    type: 'single-choice',
    options: [
      { value: 'hotel', label: 'Hotel' },
      { value: 'resort', label: 'Resort' },
      { value: 'airbnb', label: 'Vacation Rental' },
      { value: 'hostel', label: 'Hostel' },
      { value: 'camping', label: 'Camping' },
      { value: 'luxury', label: 'Luxury Villa' }
    ]
  },
  {
    id: 'activities',
    title: "What activities interest you?",
    icon: Heart,
    type: 'multi-choice',
    options: [
      { value: 'beach', label: 'Beach & Water Sports' },
      { value: 'hiking', label: 'Hiking & Nature' },
      { value: 'culture', label: 'Museums & Culture' },
      { value: 'food', label: 'Food & Wine' },
      { value: 'adventure', label: 'Adventure Sports' },
      { value: 'wellness', label: 'Spa & Wellness' },
      { value: 'nightlife', label: 'Nightlife' },
      { value: 'shopping', label: 'Shopping' },
      { value: 'wildlife', label: 'Wildlife & Safari' },
      { value: 'photography', label: 'Photography' }
    ]
  },
  {
    id: 'pace',
    title: "What's your travel pace?",
    icon: Zap,
    type: 'single-choice',
    options: [
      { value: 'relaxed', label: 'Relaxed - Plenty of downtime' },
      { value: 'moderate', label: 'Moderate - Mix of activities and rest' },
      { value: 'fast-paced', label: 'Fast-paced - Pack it all in!' }
    ]
  },
  {
    id: 'climate',
    title: "What climate do you prefer?",
    icon: Cloud,
    type: 'single-choice',
    options: [
      { value: 'tropical', label: 'Tropical & Warm' },
      { value: 'temperate', label: 'Mild & Temperate' },
      { value: 'cold', label: 'Cool & Cold' },
      { value: 'dry', label: 'Desert & Dry' },
      { value: 'any', label: 'No Preference' }
    ]
  },
  {
    id: 'sustainability',
    title: "How important is eco-friendly travel?",
    icon: Leaf,
    type: 'single-choice',
    options: [
      { value: 'high', label: 'Very Important - Prioritize sustainability' },
      { value: 'medium', label: 'Somewhat Important - Balance is key' },
      { value: 'low', label: 'Not a Priority - Focus on experience' }
    ]
  },
  {
    id: 'specialInstructions',
    title: "Any special requests or preferences?",
    icon: MessageSquare,
    type: 'text'
  }
]

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any>({
    budget: { min: 1000, max: 5000, currency: 'USD' },
    duration: { days: 7, flexibility: 'flexible' },
    travelDates: { startDate: '', flexibility: 'flexible' },
    tripType: '',
    accommodationType: '',
    activities: [],
    interests: [],
    pace: '',
    climate: '',
    destinations: { preferred: [], avoid: [] },
    transportation: 'any',
    dietary: [],
    accessibility: [],
    sustainability: '',
    specialInstructions: ''
  })

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(answers as UserPreferences)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleAnswer = (value: any) => {
    const question = questions[currentQuestion]
    
    if (question.type === 'multi-choice') {
      setAnswers({
        ...answers,
        [question.id]: answers[question.id].includes(value)
          ? answers[question.id].filter((v: string) => v !== value)
          : [...answers[question.id], value]
      })
    } else {
      setAnswers({
        ...answers,
        [question.id]: value
      })
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-beige-800">Plan Your Perfect Vacation</h2>
            <span className="text-sm text-beige-600">{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="w-full bg-beige-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-beige-500 rounded-full"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="card"
          >
            <div className="flex items-center mb-6">
              {questions[currentQuestion].icon && (
                React.createElement(questions[currentQuestion].icon, {
                  className: "w-8 h-8 text-beige-600 mr-4"
                })
              )}
              <h3 className="text-2xl font-semibold text-beige-800">
                {questions[currentQuestion].title}
              </h3>
            </div>

            {questions[currentQuestion].type === 'budget' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Minimum Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={answers.budget.min}
                    onChange={(e) => setAnswers({
                      ...answers,
                      budget: { ...answers.budget, min: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Maximum Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={answers.budget.max}
                    onChange={(e) => setAnswers({
                      ...answers,
                      budget: { ...answers.budget, max: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
              </div>
            )}

            {questions[currentQuestion].type === 'duration' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    value={answers.duration.days}
                    onChange={(e) => setAnswers({
                      ...answers,
                      duration: { ...answers.duration, days: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-beige-700 mb-2">
                    Flexibility
                  </label>
                  <select
                    value={answers.duration.flexibility}
                    onChange={(e) => setAnswers({
                      ...answers,
                      duration: { ...answers.duration, flexibility: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500"
                  >
                    <option value="exact">Exact dates</option>
                    <option value="flexible">Flexible (±2 days)</option>
                    <option value="minimum">Minimum duration</option>
                  </select>
                </div>
              </div>
            )}

            {questions[currentQuestion].type === 'single-choice' && (
              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestion].options?.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      answers[questions[currentQuestion].id] === option.value
                        ? 'border-beige-500 bg-beige-50'
                        : 'border-beige-200 hover:border-beige-300'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            )}

            {questions[currentQuestion].type === 'multi-choice' && (
              <div className="grid grid-cols-2 gap-3">
                {questions[currentQuestion].options?.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                      answers[questions[currentQuestion].id].includes(option.value)
                        ? 'border-beige-500 bg-beige-50'
                        : 'border-beige-200 hover:border-beige-300'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            )}

            {questions[currentQuestion].type === 'text' && (
              <div className="space-y-4">
                <textarea
                  value={answers.specialInstructions || ''}
                  onChange={(e) => setAnswers({
                    ...answers,
                    specialInstructions: e.target.value
                  })}
                  placeholder="Tell us about any specific preferences, dietary restrictions, mobility needs, or special requests for your trip..."
                  className="w-full px-4 py-3 border border-beige-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-500 resize-none h-32"
                />
                <p className="text-sm text-beige-600">
                  This helps us personalize your recommendations even further.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${
              currentQuestion === 0
                ? 'bg-beige-200 text-beige-400 cursor-not-allowed'
                : 'bg-beige-300 text-beige-700 hover:bg-beige-400'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="flex items-center space-x-2 btn-primary"
          >
            <span>{currentQuestion === questions.length - 1 ? 'Get Recommendations' : 'Next'}</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}