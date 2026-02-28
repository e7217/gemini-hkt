'use client'

import { useEffect, useState } from 'react'
import { useLifePathStore } from '@/store/useLifePathStore'

export const LOADING_MESSAGES = [
  '🔍 경로를 탐색 중...',
  '🌿 분기점을 찾는 중...',
  '🔗 합류점을 연결하는 중...',
  '🌱 나무를 심는 중...',
] as const

const MESSAGE_INTERVAL_MS = 2000
const FADE_OUT_DURATION_MS = 500

export function LoadingAnimation() {
  const isLoading = useLifePathStore(s => s.isLoading)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(isLoading)
  const [shouldRender, setShouldRender] = useState(isLoading)

  // Effect 1: Cycle through loading messages every 2 seconds
  useEffect(() => {
    const id = setInterval(
      () => setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length),
      MESSAGE_INTERVAL_MS
    )
    return () => clearInterval(id)
  }, [])

  // Effect 2: Handle show/hide based on isLoading changes
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      setIsVisible(true)
      return
    }
    setIsVisible(false)
    const id = setTimeout(() => setShouldRender(false), FADE_OUT_DURATION_MS)
    return () => clearTimeout(id)
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 transition-opacity duration-500 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className="text-6xl loading-tree-pulse select-none"
          aria-hidden="true"
        >
          🌱
        </div>
        <div
          className="w-12 h-12 rounded-full border-4 border-muted border-t-emerald-400 animate-spin"
          aria-hidden="true"
        />
        <p
          key={messageIndex}
          className="text-foreground text-lg font-medium tracking-wide loading-message-enter"
          role="status"
          aria-live="polite"
          aria-label="경로 생성 진행 상황"
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <p className="text-muted-foreground text-sm">잠시만 기다려 주세요...</p>
      </div>
    </div>
  )
}
