import type {
  DndState,
  DragListener,
  DragEvent,
  PinchListener,
  PinchEvent,
} from '.'
import { DragState } from './state/drag-state'
import { IdleState } from './state/idle-state'
import { PinchState } from './state/pinch-state'

export interface TouchStateHandler {
  name: string
  touchStart(event: TouchEvent): void
  touchMove(event: TouchEvent): void
  touchEnd(event: TouchEvent): void
}

export type TouchState = 'idle' | 'drag' | 'pinch'

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
  private _el: HTMLElement | undefined
  private dragListeners: DragListener[] = []
  private zoomListeners: PinchListener[] = []
  private _param: Required<DndInitParam>

  private currentState: TouchStateHandler
  public _rect: DOMRect | undefined
  /**
   * relative to viewport(canvas)
   */
  public startX = 0
  /**
   * relative to viewport(canvas)
   */
  public startY = 0
  public initialDistance = 0
  private _stateMap: Map<TouchState, TouchStateHandler> = new Map()
  private _pinchEvent: PinchEvent | undefined
  private _dragEvent: DragEvent | undefined
  private unsubs: (() => void)[] = []
  private _touchEventSupported: boolean

  constructor(el: HTMLElement, param?: DndInitParam) {
    this._touchEventSupported = 'TouchEvent' in window
    this._el = el
    this._param = (param as Required<DndInitParam>) || DefaultDndParam
    this._stateMap.set('idle', new IdleState(this))
    this._stateMap.set('drag', new DragState(this))
    this._stateMap.set('pinch', new PinchState(this))
    this.currentState = this.setState('idle')

    this.unsubs.push(this._initMouseListeners(el), this._initTouchListeners(el))
  }
  private get pinchEvent(): PinchEvent {
    if (!this._pinchEvent) {
      throw new Error('pinch event not set')
    }
    return this._pinchEvent
  }
  public setState(state: TouchState, event?: TouchEvent): TouchStateHandler {
    const handler = this._stateMap.get(state)
    if (!handler) {
      throw new Error('check the state: ' + state)
    }
    const { currentState } = this
    if (handler === currentState) {
      return handler
    }
    if (event) {
      handler.touchStart(event)
    }
    this.currentState = handler
    return handler
  }

  public hasRect(): boolean {
    return !!this._rect
  }
  public getRect(): DOMRect {
    const { _rect } = this
    if (!_rect) {
      throw new Error('no DOMRect caputured')
    }
    return _rect
  }

  public updateRect(): DOMRect {
    if (!this._el) {
      throw new Error('no element to capture')
    }
    return (this._rect = this._el.getBoundingClientRect())
  }
  captureStart(event: TouchEvent | MouseEvent) {
    let clientX = 0
    let clientY = 0
    if (this._touchEventSupported && event instanceof TouchEvent) {
      const [touch] = event.touches
      if (!touch) {
        console.error('DragState: Invalid state on entry.')
        this.resetInteraction()
        this.setState('idle')
        return
      }
      clientX = touch.clientX
      clientY = touch.clientY
    } else if (event instanceof MouseEvent) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      throw new Error('check event type ' + event)
    }

    const rect = this.updateRect()

    this.startX = clientX - rect.left
    this.startY = clientY - rect.top
  }
  public resetInteraction(): void {
    this._rect = undefined
    this.startX = 0
    this.startY = 0
    this.initialDistance = 0
    this.setState('idle')
  }
  /**
   *
   * @param state
   * @param x delta x from left top corner
   * @param y delta y from left top corner
   * @param e
   * @returns
   */
  public _emitDragging(
    state: DndState,
    x: number,
    y: number,
    e: MouseEvent | TouchEvent
  ): void {
    const dx = x - this.startX
    const dy = y - this.startY

    if (state === 'before') {
      const { x: sx, y: sy } = this._param.translate(
        state,
        this.startX,
        this.startY
      )
      this._dragEvent = {
        dx,
        dy,
        sx,
        sy,
        state: 'before',
        originalEvent: e,
      }
    }
    const { _dragEvent: evt } = this
    if (!evt) {
      console.error('DragState: Invalid state on entry.')
      this.resetInteraction()
      return
    }
    evt.dx = dx
    evt.dy = dy
    const event: DragEvent = Object.freeze<DragEvent>(
      Object.assign({}, this._dragEvent)
    )
    for (const listener of this.dragListeners) {
      if (state === 'before') listener.before?.(event)
      else if (state === 'dragging') listener.dragging?.(event)
      else if (state === 'end') listener.end?.(event)
    }
    if (state === 'end') {
      this._dragEvent = undefined
    }
  }

  public emitPinchStart(e: TouchEvent): void {
    this.updateRect()
    const [touch1, touch2] = e.touches
    this.initialDistance = this._getTouchDistance(touch1, touch2)
    const center = this._getTouchCenter(touch1, touch2)
    const rect = this.getRect()
    this._pinchEvent = {
      scale: 1,
      centerX: center.x - rect.left,
      centerY: (center.y = rect.top),
      originalEvent: e,
    }
    const event: PinchEvent = Object.freeze<PinchEvent>(
      Object.assign({}, this._pinchEvent)
    )
    for (const listener of this.zoomListeners) {
      listener.before?.(event)
    }
  }

  public emitPinching(e: TouchEvent): void {
    if (this.currentState.name !== 'pinch') {
      console.warn(
        `_emitZooming called in unexpected state: ${this.currentState.constructor.name}`
      )
      return
    }
    const { pinchEvent, initialDistance } = this
    const rect = this.getRect()

    const [touch1, touch2] = e.touches
    const dist = this._getTouchDistance(touch1, touch2)
    const center = this._getTouchCenter(touch1, touch2)
    const scale = dist / initialDistance
    pinchEvent.scale = scale
    pinchEvent.centerX = center.x - rect.left
    pinchEvent.centerY = center.y = rect.top
    pinchEvent.originalEvent = e
    const event: PinchEvent = Object.freeze<PinchEvent>(
      Object.assign({}, pinchEvent)
    )
    for (const listener of this.zoomListeners) {
      listener.zooming?.(event)
    }
  }

  public emitPinchEnd(e: TouchEvent): void {
    const { pinchEvent } = this
    pinchEvent.originalEvent = e
    const event: PinchEvent = Object.freeze<PinchEvent>(pinchEvent)
    for (const listener of this.zoomListeners) {
      listener.end?.(event)
    }
    this._pinchEvent = undefined
  }

  addDragListener(listener: DragListener) {
    this.dragListeners.push(listener)
  }
  addPinchListener(listener: PinchListener) {
    this.zoomListeners.push(listener)
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

  private _initMouseListeners(el: HTMLElement): () => void {
    const startHandler = (e: MouseEvent) => {
      this.captureStart(e)
      this._emitDragging('before', this.startX, this.startY, e)
    }
    const moveHandler = (e: MouseEvent) => {
      if (!this._dragEvent) {
        return
      }
      const rect = this.getRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top
      this._emitDragging('dragging', currentX, currentY, e)
    }
    const endHandler = (e: MouseEvent) => {
      if (!this._dragEvent) {
        return
      }
      const rect = this.getRect()
      const endX = e.clientX - rect.left
      const endY = e.clientY - rect.top
      this._emitDragging('end', endX, endY, e)
      this.resetInteraction()
    }
    el.addEventListener('mousedown', startHandler)
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', endHandler)
    return () => {
      el.removeEventListener('mousedown', startHandler)
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', endHandler)
    }
  }

  private _initTouchListeners(el: HTMLElement): () => void {
    const startHandler = (e: TouchEvent) => {
      e.preventDefault()
      this.currentState.touchStart(e)
    }
    const moveHandler = (e: TouchEvent) => {
      if (!(this.currentState instanceof IdleState)) {
        e.preventDefault()
        this.currentState.touchMove(e)
      }
    }
    const endHandler = (e: TouchEvent) => {
      if (!(this.currentState instanceof IdleState)) {
        this.currentState.touchEnd(e)
      }
    }
    const options = { passive: false }
    el.addEventListener('touchstart', startHandler, options)
    window.addEventListener('touchmove', moveHandler, options)
    window.addEventListener('touchend', endHandler, options)
    window.addEventListener('touchcancel', endHandler, options)
    return () => {
      el.removeEventListener('touchstart', startHandler)
      window.removeEventListener('touchmove', moveHandler)
      window.removeEventListener('touchend', endHandler)
      window.removeEventListener('touchcancel', endHandler)
    }
  }
  public release() {
    this._el = undefined
    this.unsubs.forEach((unsub) => {
      try {
        unsub()
      } catch (e) {
        console.error('unsub error: ignore this error', e)
      }
    })
    this.unsubs.splice(0, this.unsubs.length)
  }
}
