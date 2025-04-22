import type {
  DndState,
  DragListener,
  DragEvent,
  ZoomListener,
  ZoomEvent,
} from '.'

export type DndInitParam = {
  translate?: (
    state: DndState,
    x: number,
    y: number
  ) => { x: number; y: number }
}

const DefaultDndParam: Required<DndInitParam> = {
  translate: (_, x, y) => ({ x, y }),
}
export class DndContext {
  private _el: HTMLElement
  private interactionMode: 'drag' | 'zoom' | null = null
  private startX = 0
  private startY = 0
  private initialDistance = 0
  private dragListeners: DragListener[] = []
  private zoomListeners: ZoomListener[] = []
  private _rect: DOMRect | undefined
  private _param: Required<DndInitParam>

  constructor(el: HTMLElement, param?: DndInitParam) {
    this._el = el
    this._param = (param as Required<DndInitParam>) || DefaultDndParam
    this._initMouseListeners()
    this._initTouchListeners() // Will call the updated version
  }

  addDragListener(listener: DragListener) {
    this.dragListeners.push(listener)
  }

  // Add method to add zoom listeners
  addZoomListener(listener: ZoomListener) {
    this.zoomListeners.push(listener)
  }

  /**
   * called for mouse* event and single touch event (dragging)
   */
  private _emitDragging(
    state: DndState,
    clientX: number,
    clientY: number,
    originalEvent: MouseEvent | TouchEvent
  ) {
    if (this.interactionMode !== 'drag' && state !== 'before') return
    if (this.interactionMode === 'zoom' && state === 'before') return

    const dx = clientX - this.startX
    const dy = clientY - this.startY
    const { x: sx, y: sy } = this._param.translate(
      state,
      this.startX,
      this.startY
    )
    const event: DragEvent = Object.freeze<DragEvent>({
      state,
      dx,
      dy,
      sx,
      sy,
      originalEvent,
    })

    if (this.interactionMode === 'drag') {
      for (const listener of this.dragListeners) {
        if (state === 'before') {
          listener.before(event)
        } else if (state === 'dragging') {
          listener.dragging(event)
        } else if (state === 'end') {
          listener.end(event)
        }
      }
    }
  }

  private _emitZooming(
    scale: number,
    centerX: number,
    centerY: number,
    originalEvent: TouchEvent
  ) {
    if (this.interactionMode !== 'zoom') return

    const event: ZoomEvent = Object.freeze({
      scale,
      centerX,
      centerY,
      originalEvent,
    })
    for (const listener of this.zoomListeners) {
      listener.zooming(event)
    }
  }

  private _emitZoomStart(originalEvent: TouchEvent) {
    if (this.interactionMode !== 'zoom') return
    console.log('Emitting Zoom Start')
    for (const listener of this.zoomListeners) {
      listener.before?.(originalEvent)
    }
  }

  private _emitZoomEnd(originalEvent: TouchEvent) {
    const wasZooming = this.interactionMode === 'zoom'
    if (!wasZooming) return
    console.log('Emitting Zoom End')
    for (const listener of this.zoomListeners) {
      listener.end?.(originalEvent)
    }
  }

  private _getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private _getTouchCenter(
    touch1: Touch,
    touch2: Touch
  ): { x: number; y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  private _initMouseListeners() {
    this._el.addEventListener('mousedown', (e) => {
      if (this.interactionMode !== null) return
      this._rect = this._el.getBoundingClientRect()
      this.startX = e.clientX - this._rect.left
      this.startY = e.clientY - this._rect.top
      this.interactionMode = 'drag'
      this._emitDragging('before', 0, 0, e)
    })

    window.addEventListener('mousemove', (e) => {
      if (this.interactionMode !== 'drag' || !this._rect) return
      const x = e.clientX - this._rect.left
      const y = e.clientY - this._rect.top
      this._emitDragging('dragging', x, y, e)
    })

    const endDrag = (e: MouseEvent) => {
      if (this.interactionMode !== 'drag' || !this._rect) return
      const x = e.clientX - this._rect.left
      const y = e.clientY - this._rect.top
      // Emit end *before* resetting mode
      this._emitDragging('end', x, y, e)
      this.interactionMode = null
      this._rect = undefined
    }
    window.addEventListener('mouseup', endDrag)
  }

  private _initTouchListeners() {
    this._el.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault()

        this._rect = this._el.getBoundingClientRect()
        if (!this._rect) return

        const touchCount = e.touches.length
        const [touch1, touch2] = e.touches
        if (this.interactionMode === null) {
          if (touchCount === 1) {
            this.interactionMode = 'drag'
            this.startX = touch1.clientX - this._rect.left
            this.startY = touch1.clientY - this._rect.top
            this._emitDragging('before', 0, 0, e)
          } else if (touchCount === 2) {
            console.log('Touch Start: Zoom')
            this.interactionMode = 'zoom'
            this.initialDistance = this._getTouchDistance(touch1, touch2)
            this._emitZoomStart(e)
          }
        } else if (this.interactionMode === 'drag') {
          if (touchCount === 2) {
            this.interactionMode = 'zoom'
            this.initialDistance = this._getTouchDistance(touch1, touch2)
            this._emitZoomStart(e)
          }
        } else if (this.interactionMode === 'zoom') {
        }
      },
      { passive: false }
    )

    window.addEventListener(
      'touchmove',
      (e) => {
        if (this.interactionMode === null || !this._rect) return
        e.preventDefault()
        const { length } = e.touches
        const [touch1, touch2] = e.touches
        if (this.interactionMode === 'drag' && length === 1) {
          // --- Drag Move ---
          const x = touch1.clientX - this._rect.left
          const y = touch1.clientY - this._rect.top
          this._emitDragging('dragging', x, y, e)
        } else if (this.interactionMode === 'zoom' && length === 2) {
          // --- Zoom Move ---
          const currentDistance = this._getTouchDistance(touch1, touch2)
          const center = this._getTouchCenter(touch1, touch2)
          if (this.initialDistance > 0) {
            const scale = currentDistance / this.initialDistance
            this._emitZooming(
              scale,
              center.x - this._rect.left,
              center.y - this._rect.top,
              e
            )
          }
        }
      },
      { passive: false }
    )

    const endTouch = (e: TouchEvent) => {
      const remainingTouches = e.touches.length
      const liftedTouch = e.changedTouches[0]

      if (this.interactionMode === 'drag') {
        if (remainingTouches === 0) {
          if (!this._rect) {
            console.error('DndContext Error: Rect not set at touch end (drag).')
            this.interactionMode = null // Reset state
            return
          }
          if (liftedTouch) {
            const x = liftedTouch.clientX - this._rect.left
            const y = liftedTouch.clientY - this._rect.top
            this._emitDragging('end', x, y, e)
          } else {
            this._emitDragging('end', 0, 0, e)
          }
          this.interactionMode = null
          this._rect = undefined
          this.initialDistance = 0
        }
      } else if (this.interactionMode === 'zoom') {
        if (remainingTouches < 2) {
          console.log('Touch End: Ending Zoom')
          this._emitZoomEnd(e)
          this.interactionMode = remainingTouches === 1 ? 'drag' : null
          this._rect = remainingTouches === 0 ? undefined : this._rect
          this.initialDistance = 0
        }
      }
    }

    window.addEventListener('touchend', endTouch, { passive: false })
    window.addEventListener('touchcancel', endTouch, { passive: false })
  }
}
