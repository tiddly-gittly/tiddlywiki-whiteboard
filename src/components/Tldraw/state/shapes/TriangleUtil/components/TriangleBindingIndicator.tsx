import * as React from 'react'
import { BINDING_DISTANCE } from '@tldr/constants'
import { getTrianglePoints } from '../triangleHelpers'

interface TriangleBindingIndicatorProps {
  size: number[]
}

export function TriangleBindingIndicator({ size }: TriangleBindingIndicatorProps) {
  const trianglePoints = getTrianglePoints(size).join()
  return (
    <polygon
      className="tl-binding-indicator"
      points={trianglePoints}
      strokeWidth={BINDING_DISTANCE * 2}
    />
  )
}
