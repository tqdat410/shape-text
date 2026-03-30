import type { Interval, ShapeTextPoint } from '../types.js'
import { getXIntersectionsAtY } from './get-x-intersections-at-y.js'

function pairIntersections(xs: number[]): Interval[] {
  const intervals: Interval[] = []

  for (let index = 0; index + 1 < xs.length; index += 2) {
    intervals.push({ left: xs[index]!, right: xs[index + 1]! })
  }

  return intervals
}

function intersectIntervalSets(leftSet: Interval[], rightSet: Interval[]): Interval[] {
  const intersections: Interval[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < leftSet.length && rightIndex < rightSet.length) {
    const left = leftSet[leftIndex]!
    const right = rightSet[rightIndex]!
    const overlapLeft = Math.max(left.left, right.left)
    const overlapRight = Math.min(left.right, right.right)

    if (overlapRight > overlapLeft) {
      intersections.push({ left: overlapLeft, right: overlapRight })
    }

    if (left.right < right.right) {
      leftIndex += 1
    } else {
      rightIndex += 1
    }
  }

  return intersections
}

export function getBandIntervalsFromPolygon(
  points: ShapeTextPoint[],
  bandTop: number,
  bandBottom: number,
  minSlotWidth = 0,
): Interval[] {
  const startRow = Math.floor(bandTop)
  const endRow = Math.max(startRow, Math.ceil(bandBottom) - 1)
  let intervals: Interval[] | null = null

  for (let row = startRow; row <= endRow; row++) {
    const rowIntervals = pairIntersections(getXIntersectionsAtY(points, row + 0.5))
    if (rowIntervals.length === 0) return []
    intervals = intervals === null ? rowIntervals : intersectIntervalSets(intervals, rowIntervals)
    if (intervals.length === 0) return []
  }

  return (intervals ?? []).filter(interval => interval.right - interval.left >= minSlotWidth)
}

