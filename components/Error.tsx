'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  message: string;
  onRetry: () => void;
}

export default function Error({ message, onRetry }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-beige-800 text-center mb-4">
            Oops! Something went wrong
          </h2>
          
          <p className="text-beige-600 text-center mb-6 font-body">
            {message}
          </p>
          
          <div className="bg-red-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 font-mono">
              Failed to generate vacation recommendations. This could be due to API limits or network issues.
            </p>
          </div>
          
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}