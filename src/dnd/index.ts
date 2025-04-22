export type DndState = 'before' | 'dragging' | 'end'

/**
 * Interface for drag events
 */
export interface DragEvent {
  /**
   * The current state of the drag operation.
   */
  state: DndState
  /**
   * The starting x coordinate of the drag.
   */
  sx: number
  /**
   * The starting y coordinate of the drag.
   */
  sy: number
  /**
   * The delta x coordinate of the drag.
   */
  dx: number
  /**
   * The delta y coordinate of the drag.
   */
  dy: number
  /** The original mouse(touch) event */
  originalEvent: MouseEvent | TouchEvent
}

export interface DragListener {
  before(e: DragEvent): void
  dragging(e: DragEvent): void
  end(e: DragEvent): void
}

export interface ZoomEvent {
  scale: number
  centerX: number
  centerY: number
  originalEvent: TouchEvent
}

export interface ZoomListener {
  before?(e: TouchEvent): void
  zooming(e: ZoomEvent): void
  end?(e: TouchEvent): void
}
