import { type IRenderer } from '.'
import { type ImageLayer } from '../image-layer'
import { type Viewport, type Point } from '../scale'
import { type ImageSource, type PhotoFlexInitParam } from '../'
import { dom } from '../util'
import { type PhotoFlexContext } from '../photo-flex-context'
import { locateOnCenter } from '../locator/locate-on-center'
import { type RendererParam } from './renderer-param'
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
    private readonly _context: PhotoFlexContext,
    readonly param: RendererParam
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
  get name() {
    return 'canvas'
  }
  get order() {
    return this.param.order
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
  get canvas() {
    return this._canvas
  }
  get ctx() {
    return this._ctx
  }
  isEmpty() {
    return this.layers.length === 0
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
  getLayerBy(predicate: (layer: ImageLayer) => boolean) {
    const found = this.layers.find(predicate)
    if (!found) {
      throw new Error('layer not found')
    }
    return found
  }
  getLayers(): ImageLayer[] {
    return this.layers
  }
  removeLayerBy(predicate: (layer: ImageLayer) => boolean) {
    const index = this.layers.findIndex(predicate)
    if (index < 0) {
      return false
    }
    const [layer] = this.layers.splice(index, 1)
    layer.clear()
    return true
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
    return this.layers.map((layer) => Object.assign({}, layer.getOffset()))
  }

  setLayerOffset(index: number, x: number, y: number): void {
    if (index >= 0 && index < this.layers.length) {
      this.layers[index].setOffset(x, y)
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
    this._canvas.style.aspectRatio = `${width / height}`
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
  capture(): { imageURL: string; image: ImageSource } {
    const buffer = document.createElement('canvas')
    const { width: W, height: H } = this._context.getViewportSize()
    const intrinsicW = W[0]
    const intrinsicH = H[0]
    buffer.width = intrinsicW
    buffer.height = intrinsicH
    buffer.style.width = `${intrinsicW}px`
    buffer.style.height = `${intrinsicH}px`
    const ctx = buffer.getContext('2d')!
    const layer = this.getFirstLayer()!
    const c = layer.getOffset()
    const { image, ratio } = layer
    const { width, height } = this
    const area = locateOnCenter({ width, height }, c, 1)

    const sx = (layer.image.width - area.width / ratio) / 2
    const sy = (layer.image.height - area.height / ratio) / 2
    const { x, y } = this._resolveOrigin(area)
    ctx.drawImage(
      layer.image.bitmap,
      sx - x / ratio,
      sy - y / ratio,
      width / ratio,
      height / ratio,
      0,
      0,
      intrinsicW,
      intrinsicH
    )
    const { mimeType } = image
    const imageURL = buffer.toDataURL(mimeType)
    return { imageURL, image }
  }
}
