import { IRenderer } from '.'
import { ImageLayer } from '../image-layer'
import { Viewport, type Point } from '../scale'
import { PhotoFlexInitParam } from '../'
import { dom } from '../util'
import { PhotoFlexContext } from '../photo-flex-context'
/**
 * translates the given point relative to origin of canvas.
 */
export type CanvasOriginResolver = (point: Point) => Point

/**
 * Renderer for canvas.
 */
export class CanvasRenderer implements IRenderer {
  private layers: ImageLayer[] = []
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private readonly _resolveOrigin: CanvasOriginResolver

  /**
   * Constructor for CanvasRenderer.
   * @param boardEl
   * @param pixelRatio
   * @param _context
   */
  constructor(
    private boardEl: HTMLDivElement,
    private _pixelRatio: number,
    private readonly _context: PhotoFlexContext
  ) {
    const { prefix, canvas } = this._context.param.classnames!
    this._canvas = dom.create<HTMLCanvasElement>(
      `canvas[data-${prefix}-${canvas}]`,
      this.boardEl
    )
    this._canvas.role = 'img'
    this._canvas.ariaLabel = 'canvas to render image. Drag to move the image.'
    dom.style(this._canvas, { zIndex: '10' })
    this._ctx = this._resize(this._canvas, this._context.param)
    this._resolveOrigin = (point: Point) => {
      const x = this.width / 2
      const y = this.height / 2
      return { x: point.x + x, y: point.y + y }
    }
  }
  get originReslover() {
    return this._resolveOrigin
  }

  get width() {
    return this._canvas.width / this._pixelRatio
  }

  get height() {
    return this._canvas.height / this._pixelRatio
  }
  get viewportSize(): Viewport {
    const { width, height } = this
    return { width, height }
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
  setCursor(cursorName: string) {
    this._canvas.style.cursor = cursorName
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
  removeLayers() {
    this.layers = []
  }

  getFirstLayer(): ImageLayer | undefined {
    return this.layers.length > 0 ? this.layers[0] : undefined
  }

  hasLayers(): boolean {
    return this.layers.length > 0
  }

  updateLayerRatiosBy(delta: number): void {
    this.layers.forEach((layer) => {
      layer.updateScaleBy(delta)
    })
  }

  setLayerRatios(ratio: number): void {
    this.layers.forEach((layer) => {
      layer.setScale(ratio)
    })
  }

  getLayerOrigins(): Point[] {
    return this.layers.map((layer) => Object.assign({}, layer.getCenter()))
  }

  setLayerOrigin(index: number, x: number, y: number): void {
    if (index >= 0 && index < this.layers.length) {
      this.layers[index].setCenter(x, y)
    }
  }
  private _resize(
    canvas: HTMLCanvasElement,
    param: PhotoFlexInitParam,
    size?: { width: number; height: number }
  ) {
    const { width: w, height: h } = size || this.boardEl.getBoundingClientRect()
    const width = w * this._pixelRatio
    const height = h * this._pixelRatio
    canvas.width = width
    canvas.height = height
    const ctx = param.loadContext!(canvas)
    ctx.scale(this._pixelRatio, this._pixelRatio)
    return ctx
  }
  resize() {
    this._ctx = this._resize(this._canvas, this._context.param)
  }
  setSize(width: number, height: number) {
    width = width || this.width
    height = height || this.height
    this._ctx = this._resize(this._canvas, this._context.param, {
      width,
      height,
    })
  }

  clear() {
    this._ctx.clearRect(0, 0, this.width, this.height)
  }

  /**
   * capture current viewport
   */
  async capture(): Promise<{ imageURL: string; name: string }> {
    const buffer = document.createElement('canvas')
    const { width, height } = this
    buffer.width = width
    buffer.height = height
    buffer.style.width = `${width}px`
    buffer.style.height = `${height}px`
    const ctx = buffer.getContext('2d')!
    const layer = this.getFirstLayer()!
    layer.draw(ctx)
    const { mimeType, uuid: name } = layer.image
    const imageURL = buffer.toDataURL(mimeType)
    return { imageURL, name }
  }
}
