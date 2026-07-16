import { PhotoFlexContext } from '../photo-flex-context'

export class WheelController {
  private _handler: (event: WheelEvent) => void
  private _unsub?: () => void
  private _wheelTimeout?: any

  constructor(private readonly _ctx: PhotoFlexContext) {
    this._handler = this._handleWheel.bind(this)
  }

  bindTo(container: HTMLElement) {
    container.addEventListener('wheel', this._handler, { passive: false })
    this._unsub = () => {
      container.removeEventListener('wheel', this._handler)
    }
  }
  private _handleWheel(event: WheelEvent): void {
    event.preventDefault()
    const delta = -event.deltaY
    const factor = this._ctx.wheelSensitivity
    const zoomDelta = delta * factor
    
    // Zoom immediately without capturing size
    this._ctx.op.updateZoomBy(zoomDelta, false)

    if (this._wheelTimeout) {
      clearTimeout(this._wheelTimeout)
    }

    this._wheelTimeout = setTimeout(() => {
      this._ctx.op.setZoom(this._ctx.op.currentZoom, true)
      this._wheelTimeout = undefined
    }, 150)
  }

  dispose(): void {
    if (this._wheelTimeout) {
      clearTimeout(this._wheelTimeout)
    }
    if (this._unsub) {
      this._unsub()
    }
  }
}
