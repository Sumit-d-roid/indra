import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type LoadingMessageProps = {
  messages: string[]
}

export function LoadingMessage({ messages }: LoadingMessageProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % messages.length)
    }, 1700)

    return () => window.clearInterval(timer)
  }, [messages.length])

  return (
    <div className="flex min-h-[18rem] items-center justify-center rounded-3xl border border-cyan-300/10 bg-slate-950/80 p-8 text-center">
      <div>
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.45em] text-cyan-200/45">inductive startup</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={messages[index]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-xl text-slate-100"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
