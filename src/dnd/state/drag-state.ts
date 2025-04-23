import type { DndContext, TouchStateHandler } from '../dnd-context'

export class DragState implements TouchStateHandler {
  constructor(readonly context: DndContext) {}
  get name() {
    return 'drag'
  }
  touchStart(event: TouchEvent): void {
    const touchCount = event.touches.length
    const { context } = this
    if (touchCount === 1) {
      context.captureStart(event)
      context._emitDragging('before', 0, 0, event)
    } else if (touchCount === 2) {
      this.context.setState('pinch', event)
    }
  }

  touchMove(event: TouchEvent): void {
    const touchCount = event.touches.length
    const { context } = this
    const rect = context.getRect()
    if (touchCount === 1) {
      const touch = event.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      context._emitDragging('dragging', x, y, event)
    } else if (touchCount >= 2) {
      console.warn(
        'DragState: Unexpected touch move with >= 2 touches. Transitioning to Pinch.'
      )
      context.setState('pinch', event)
    }
  }

  touchEnd(event: TouchEvent): void {
    const remainingTouches = event.touches.length
    const { context } = this
    const rect = context.getRect()

    if (remainingTouches === 0) {
      const liftedTouch = event.changedTouches[0]
      if (liftedTouch) {
        const endX = liftedTouch.clientX - rect.left
        const endY = liftedTouch.clientY - rect.top
        context._emitDragging('end', endX, endY, event)
      } else {
        context._emitDragging('end', context.startX, context.startY, event) // Fallback with start coords
      }
      context.resetInteraction()
    }
  }
}
