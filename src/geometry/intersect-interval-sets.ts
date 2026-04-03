import type { Interval } from '../types.js'

export function intersectIntervalSets(leftSet: Interval[], rightSet: Interval[]): Interval[] {
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
