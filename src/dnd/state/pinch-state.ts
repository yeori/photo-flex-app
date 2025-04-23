import { DndContext, TouchStateHandler } from '../dnd-context'

export class PinchState implements TouchStateHandler {
  constructor(readonly context: DndContext) {}
  get name() {
    return 'pinch'
  }
  touchStart(event: TouchEvent): void {
    const { context } = this
    context.emitPinchStart(event)
  }

  touchMove(event: TouchEvent): void {
    const touchCount = event.touches.length
    const { context } = this

    if (touchCount === 2) {
      context.emitPinching(event)
    } else if (touchCount < 2) {
      console.warn('PinchState: Unexpected touch move with < 2 touches.')
      this.touchEnd(event)
    }
  }

  touchEnd(event: TouchEvent): void {
    const remainingTouches = event.touches.length
    const { context } = this
    context.emitPinchEnd(event)

    if (remainingTouches === 1) {
      context.setState('drag', event)
    } else if (remainingTouches === 0) {
      context.resetInteraction()
      context.setState('idle', event)
    } else if (remainingTouches >= 2) {
      console.warn(
        'PinchState: Exiting pinch with >= 2 touches remaining (possibly touchcancel). Resetting to Idle.'
      )
      context.resetInteraction()
    }
  }
}
