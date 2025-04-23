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
   * The delta x of the drag.
   */
  dx: number
  /**
   * The delta y of the drag.
   */
  dy: number
  /** The original mouse(touch) event */
  originalEvent: MouseEvent | TouchEvent
}

/**
 * Interface for drag listener
 */
export interface DragListener {
  /**
   * Callback when drag start
   * @param e
   */
  before?(e: DragEvent): void
  /**
   * Callback when dragging
   * @param e
   */
  dragging?(e: DragEvent): void
  /**
   * Callback when drag end
   * @param e
   */
  end?(e: DragEvent): void
}

/**
 * Interface for pinch events.
 */
export interface PinchEvent {
  /**
   * The current scale of the zoom.
   */
  scale: number
  /**
   * The center x coordinate of the zoom.
   */
  centerX: number
  /**
   * The center y coordinate of the zoom.
   */
  centerY: number
  /**
   * The original touch event
   */
  originalEvent: TouchEvent
}

/**
 * Interface for zoom listener.
 */
export interface PinchListener {
  /**
   * Callback before zooming.
   * @param e - The touch event.
   */
  before?(e: PinchEvent): void
  /**
   * Callback while zooming.
   * @param e - The zoom event.
   */
  zooming?(e: PinchEvent): void
  /**
   * Callback when zooming end.
   * @param e - The touch event.\
   */
  end?(e: PinchEvent): void
}
