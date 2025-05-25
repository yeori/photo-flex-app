import { type IView } from '.'
import { type ImageSource } from '../image-source'
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
  get name() {
    return 'after-image-view'
  }
  bindTo(container: HTMLElement): void {
    container.appendChild(this._canvas)
    const { _ctx } = this
    _ctx.subscribe('open', (payload) => {
      const { width, height } = payload.image
      this._render(width, height, payload.image)
    })
    _ctx.subscribe('zoom', (payload) => {
      const { image } = payload
      const { width, height } = image
      this._render(width, height, image)
    })
    _ctx.subscribe('move', ({ offset }) => {
      this._setOrigin(offset.cx, offset.cy)
    })
    _ctx.subscribe('source', (payload) => {
      const { type } = payload
      if (type === 'deleted') {
        this._render(0, 0)
      }
    })
  }
  private _setOrigin(x: number, y: number) {
    dom.style(this._canvas, {
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    })
  }
  private _render(width: number, height: number, image?: ImageSource) {
    const ctx = this._canvas.getContext('2d')!
    this._canvas.width = width
    this._canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = this.opacity
    if (image) {
      ctx.drawImage(image.bitmap, 0, 0)
    }
    const ratio = this._ctx.op.currentZoom
    const el = this._canvas
    el.style.width = `${width * ratio}px`
    el.style.height = `${height * ratio}px`
  }
}
