"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function LoadingScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide loading screen after delay
    const hideTimeout = setTimeout(() => {
      setVisible(false)
    }, 2000)

    return () => clearTimeout(hideTimeout)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <h1 className="font-semibold text-2xl md:text-3xl text-gray-900 tracking-tight mb-2">KLYRA</h1>
          <div className="flex space-x-1">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1,
                delay: 0,
              }}
              className="w-2 h-2 bg-indigo-600 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1,
                delay: 0.2,
              }}
              className="w-2 h-2 bg-indigo-600 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1,
                delay: 0.4,
              }}
              className="w-2 h-2 bg-indigo-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
