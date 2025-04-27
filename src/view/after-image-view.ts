import { type IView } from '.'
import { type ImageSource } from '../image-source'
import type { ImageLayer } from '../photo-flex'
import { type PhotoFlexContext } from '../photo-flex-context'
import { dom } from '../util'

export class AfterImageView implements IView {
  private _canvas: HTMLCanvasElement
  private readonly opacity = 0.2
  constructor(private readonly _ctx: PhotoFlexContext) {
    const el = (this._canvas = dom.create<HTMLCanvasElement>('canvas'))
    dom.style(el, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%)`,
      pointerEvents: 'none',
    })
    this._render(0, 0)
  }
  bindTo(container: HTMLElement): void {
    container.appendChild(this._canvas)
    const { eventBus } = this._ctx
    eventBus.subscribe('open', (payload) => {
      const { width, height } = payload.image
      this._render(width, height, payload.image)
    })
    eventBus.subscribe('zoom', (payload) => {
      const layer: ImageLayer = this._ctx.op.getLayer(payload.layer)
      const { width, height } = layer.image
      this._render(width, height)
    })
    eventBus.subscribe('move', (payload) => {
      this._setOrigin(payload.cx, payload.cy)
    })
  }
  private _setOrigin(x: number, y: number) {
    dom.style(this._canvas, {
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    })
  }
  private _render(width: number, height: number, image?: ImageSource) {
    if (image) {
      this._canvas.width = width
      this._canvas.height = height
      const ctx = this._canvas.getContext('2d')!
      ctx.globalAlpha = this.opacity
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(image.bitmap, 0, 0)
    }
    const ratio = this._ctx.op.currentZoom
    const el = this._canvas
    el.style.width = `${width * ratio}px`
    el.style.height = `${height * ratio}px`
  }
}
