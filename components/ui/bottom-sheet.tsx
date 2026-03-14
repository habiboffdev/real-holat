'use client'

import { motion, useDragControls, useAnimation, PanInfo } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface BottomSheetProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  snapPoints?: number[] // Array of percentages [0.3, 0.8] representing screen height
  defaultSnap?: number
  backdrop?: boolean
}

export function BottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints = [0.4, 0.85],
  defaultSnap = 0.4,
  backdrop = false,
}: BottomSheetProps) {
  const controls = useAnimation()
  const dragControls = useDragControls()
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)

  useEffect(() => {
    setCurrentSnap(defaultSnap)
  }, [defaultSnap])

  useEffect(() => {
    if (isOpen) {
      controls.start({ y: `${100 - currentSnap * 100}%` })
    } else {
      controls.start({ y: '100%' })
    }
  }, [isOpen, currentSnap, controls])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const isDraggingDown = info.velocity.y > 0
    const isDraggingFast = Math.abs(info.velocity.y) > 500

    if (isDraggingFast && isDraggingDown) {
      if (currentSnap === snapPoints[1]) {
        // Drop down to lower snap point
        setCurrentSnap(snapPoints[0])
      } else {
        // Close entirely
        onClose()
      }
      return
    }

    if (isDraggingFast && !isDraggingDown) {
      // Snap to upper point
      setCurrentSnap(snapPoints[1])
      return
    }

    // Measure screen height percentage dragged
    const screenH = window.innerHeight
    const draggedToY = info.point.y
    const percentY = 1 - (draggedToY / screenH)

    // Find closest snap point
    let closest = snapPoints[0]
    let minDiff = Math.abs(percentY - snapPoints[0])

    for (const snap of snapPoints) {
      const diff = Math.abs(percentY - snap)
      if (diff < minDiff) {
        minDiff = diff
        closest = snap
      }
    }

    // If they dragged way below lowest point, close it
    if (percentY < snapPoints[0] - 0.15) {
      onClose()
    } else {
      setCurrentSnap(closest)
    }
  }

  return (
    <>
      {backdrop && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        />
      )}

      <motion.div
        initial={{ y: '100%' }}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false} // Only drag by handle
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="fixed bottom-0 left-0 right-0 z-50 flex h-dvh flex-col rounded-t-[32px] bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border border-border/50"
        style={{
          boxShadow: '0 -4px 32px rgba(12, 27, 46, 0.15)',
        }}
      >
        {/* Drag Handle Top Bar */}
        <div
          className="flex w-full items-center justify-center pt-3 pb-4 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-5 pb-safe scx-hide-scrollbar overscroll-contain"
          // Crucial: stop propagation so scrolling content doesn't drag the sheet
          onPointerDown={(e) => e.stopPropagation()} 
        >
          {children}
        </div>
      </motion.div>
    </>
  )
}
