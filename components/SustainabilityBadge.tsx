'use client'

import { Leaf } from 'lucide-react'
import { motion } from 'framer-motion'

interface SustainabilityBadgeProps {
  score: number;
  size?: 'small' | 'large';
}

export default function SustainabilityBadge({ score, size = 'small' }: SustainabilityBadgeProps) {
  const getColor = () => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  const getLabel = () => {
    if (score >= 8) return 'Highly Sustainable'
    if (score >= 6) return 'Moderately Sustainable'
    return 'Low Sustainability'
  }

  if (size === 'small') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getColor()}`}
      >
        <Leaf className="w-4 h-4 mr-1" />
        <span className="font-medium">{score}/10</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border-2 ${getColor()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Sustainability Score</h3>
        <Leaf className="w-8 h-8" />
      </div>
      <div className="text-3xl font-bold mb-2">{score}/10</div>
      <p className="text-sm opacity-80">{getLabel()}</p>
    </motion.div>
  )
}