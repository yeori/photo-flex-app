import type { DndState, DragListener, DragEvent } from '.'
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
  private isDragging = false
  private startX = 0
  private startY = 0
  private listeners: DragListener[] = []
  private _rect: DOMRect | undefined
  private _param: Required<DndInitParam>
  constructor(el: HTMLElement, param?: DndInitParam) {
    this._el = el
    this._param = (param as Required<DndInitParam>) || DefaultDndParam
    this._initMouseListeners()
    this._initTouchListeners()
  }

  addListener(listener: DragListener) {
    this.listeners.push(listener)
  }

  // private _applyTranslate(
  //   state: DndState,
  //   x: number,
  //   y: number
  // ): [number, number] {
  //   if (this._param.translate) {
  //     const { x: tx, y: ty } = this._param.translate(state, x, y)
  //     return [tx, ty]
  //   }
  //   return [x, y]
  // }
  private _emit(
    state: DndState,
    clientX: number,
    clientY: number,
    originalEvent: MouseEvent | TouchEvent
  ) {
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

    for (const listener of this.listeners) {
      if (state === 'before') {
        listener.before(event)
      } else if (state === 'dragging') {
        listener.dragging(event)
      } else if (state === 'end') {
        listener.end(event)
      }
    }
  }

  // Mouse support
  private _initMouseListeners() {
    this._el.addEventListener('mousedown', (e) => {
      this._rect = this._el.getBoundingClientRect()
      this.startX = e.clientX - this._rect.left
      this.startY = e.clientY - this._rect.top
      // ;[this.startX, this.startY] = this._applyTranslate(
      //   'before',
      //   e.clientX - this._rect.left,
      //   e.clientY - this._rect.top
      // )
      this.isDragging = true
      this._emit('before', 0, 0, e)
    })

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return
      if (!this._rect) {
        throw new Error('application bug', { cause: 'DND_RECT_NOT_SET' })
      }
      const x = e.clientX - this._rect.left
      const y = e.clientY - this._rect.top
      this._emit('dragging', x, y, e)
    })

    const endDrag = (e: MouseEvent) => {
      if (!this.isDragging) return
      if (!this._rect) {
        throw new Error('application bug', { cause: 'DND_RECT_NOT_SET' })
      }
      const x = e.clientX - this._rect.left
      const y = e.clientY - this._rect.top
      this.isDragging = false
      this._rect = undefined
      this._emit('end', x, y, e)
    }

    window.addEventListener('mouseup', endDrag)
    // this._el.addEventListener('mouseleave', endDrag)
  }

  // Touch support
  private _initTouchListeners() {
    this._el.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return
        this._rect = this._el.getBoundingClientRect()
        const touch = e.touches[0]
        this.startX = touch.clientX - this._rect.left
        this.startY = touch.clientY - this._rect.right
        // ;[this.startX, this.startY] = this._applyTranslate(
        //   'before',
        //   touch.clientX - this._rect.left,
        //   touch.clientY - this._rect.top
        // )
        this.isDragging = true
        this._emit('before', 0, 0, e)
      },
      { passive: false }
    )

    window.addEventListener(
      'touchmove',
      (e) => {
        if (!this.isDragging || e.touches.length !== 1) return
        if (!this._rect) {
          throw new Error('application bug', { cause: 'DND_RECT_NOT_SET' })
        }
        const touch = e.touches[0]
        this._emit('dragging', touch.clientX, touch.clientY, e)
      },
      { passive: false }
    )

    const endTouch = (e: TouchEvent) => {
      if (!this.isDragging) return
      const touch = e.changedTouches[0]
      this.isDragging = false
      this._emit('end', touch.clientX, touch.clientY, e)
    }

    window.addEventListener('touchend', endTouch, { passive: false })
    window.addEventListener('touchcancel', endTouch, { passive: false })
  }
}
