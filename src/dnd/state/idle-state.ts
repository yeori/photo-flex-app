import type { DndContext, TouchStateHandler } from '../dnd-context'

export class IdleState implements TouchStateHandler {
  constructor(readonly context: DndContext) {}
  get name() {
    return 'idle'
  }
  touchStart(event: TouchEvent): void {
    const touchCount = event.touches.length
    const { context } = this
    if (touchCount === 1) {
      context.setState('drag', event)
    } else if (touchCount === 2) {
      context.setState('pinch', event)
    }
  }

  touchMove(): void {}

  touchEnd(): void {}
}
