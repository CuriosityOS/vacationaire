'use client'

import { motion } from 'framer-motion'
import { Compass, Leaf, MapPin } from 'lucide-react'

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 gradient-beige opacity-30"></div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-20 w-64 h-64 bg-beige-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sand-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-beige-200 rounded-full blur-3xl"></div>
      </motion.div>

      <div className="container mx-auto px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8 space-x-4"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Compass className="w-12 h-12 text-beige-600" />
          </motion.div>
          <MapPin className="w-12 h-12 text-beige-500" />
          <Leaf className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold mb-6 text-beige-800"
        >
          Vacationaire
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-beige-700 mb-12 max-w-2xl mx-auto font-body"
        >
          Discover your perfect vacation with AI-powered recommendations tailored to your preferences and values
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="btn-primary text-lg px-10 py-4"
        >
          Start Planning Your Journey
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex justify-center items-center space-x-8 text-sm text-beige-600"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Eco-Friendly Options</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-beige-500 rounded-full"></div>
            <span>Personalized Itineraries</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-sand-500 rounded-full"></div>
            <span>Budget Conscious</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-beige-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-beige-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
}