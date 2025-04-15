import { PhotoFlexContext } from '../photo-flex-context'

export class WheelController {
  private _handler: (event: WheelEvent) => void
  private _unsub?: () => void

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
    this._ctx.op.updateZoomBy(zoomDelta)
  }

  dispose(): void {
    if (this._unsub) {
      this._unsub()
    }
  }
}
