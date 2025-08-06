'use client'

import { motion } from 'framer-motion'
import { Compass, MapPin, Leaf } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center space-x-8 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Compass className="w-12 h-12 text-beige-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <MapPin className="w-12 h-12 text-beige-500" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Leaf className="w-12 h-12 text-green-600" />
          </motion.div>
        </div>
        
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-semibold text-beige-800 mb-4"
        >
          Planning Your Perfect Vacation
        </motion.h3>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-beige-600 font-body"
        >
          Our AI is analyzing your preferences and finding the best destinations...
        </motion.p>
        
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-3 h-3 bg-beige-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}