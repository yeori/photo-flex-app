import { IRenderer } from '.'
import { ImageLayer } from '../image-layer'
import { type Point } from '../scale'
import { PhotoFlexInitParam } from '../'
import { dom } from '../util'

/**
 * Renderer for canvas.
 */
export class CanvasRenderer implements IRenderer {
  private layers: ImageLayer[] = []
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private readonly _pixelRatio: number

  /**
   * Constructor for CanvasRenderer.
   * @param boardEl
   * @param pixelRatio
   * @_param _param
   */
  constructor(
    private boardEl: HTMLDivElement,
    pixelRatio: number,
    private readonly _param: PhotoFlexInitParam
  ) {
    const { prefix, canvas } = _param.classnames!
    this._canvas = dom.create<HTMLCanvasElement>(
      `canvas[data-${prefix}${canvas}]`,
      this.boardEl
    )
    this._pixelRatio = pixelRatio
    this._ctx = this._resize(this._canvas, _param)
  }

  get width() {
    return this._canvas.width / this._pixelRatio
  }

  get height() {
    return this._canvas.height / this._pixelRatio
  }

  get ctxContext() {
    return this._ctx
  }

  get canvas() {
    return this._canvas
  }

  get ctx() {
    return this._ctx
  }

  /**
   * Render layers on the canvas.
   * @param ctx
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.layers.forEach((layer) => {
      layer.draw(ctx)
    })
  }

  addLayer(layer: ImageLayer): void {
    this.layers.push(layer)
  }

  getLayers(): ImageLayer[] {
    return this.layers
  }

  getFirstLayer(): ImageLayer | undefined {
    return this.layers.length > 0 ? this.layers[0] : undefined
  }

  hasLayers(): boolean {
    return this.layers.length > 0
  }

  updateLayerRatiosBy(delta: number): void {
    this.layers.forEach((layer) => {
      layer.updateRatioBy(delta)
    })
  }

  setLayerRatios(ratio: number): void {
    this.layers.forEach((layer) => {
      layer.setRatio(ratio)
    })
  }

  getLayerOrigins(): Point[] {
    return this.layers.map((layer) => Object.assign({}, layer.getOrigin()))
  }

  setLayerOrigin(index: number, x: number, y: number): void {
    if (index >= 0 && index < this.layers.length) {
      this.layers[index].setOrigin(x, y)
    }
  }

  private _resize(canvas: HTMLCanvasElement, param: PhotoFlexInitParam) {
    const [w, wUnit] = dom.parseUnit(param.width!)
    const [h, hUnit] = dom.parseUnit(param.height!)
    const width = w * this._pixelRatio
    const height = h * this._pixelRatio
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${w}${wUnit}`
    canvas.style.height = `${h}${hUnit}`
    const ctx = param.loadContext!(canvas)
    ctx.scale(this._pixelRatio, this._pixelRatio)
    return ctx
  }
  resize() {
    this._ctx = this._resize(this._canvas, this._param)
  }

  clear() {
    this._ctx.clearRect(0, 0, this.width, this.height)
  }
}
