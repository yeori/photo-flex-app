import { ImageRect } from './event'
import { ImageSource } from './image-source'
import { locateOnCenter } from './locator/locate-on-center'
import { CanvasOriginResolver } from './rendering/canvas-view'
import { Point, Area, ImageCacheParam, Viewport } from './scale'
import { dom } from './util'

/**
 * It represents layer of image.
 */
export class ImageLayer {
  /**
   * relative area of image from this._center
   */
  private _area: Area
  private constructor(
    public readonly uuid: string,
    private _image: ImageSource,
    private readonly _translateToSceen: CanvasOriginResolver,
    /**
     * offset from center of viewport(0, 0) to center of image.
     * ```
     * offset = image.center - viewport.center
     * ```
     * if (-, -), then image is on left-top of viewport.(or the viewport is on right-bottom of image)
     */
    private _offset: Point,
    private _scale: number
  ) {
    this._area = this._captureArea()
  }
  get image(): ImageSource {
    return this._image
  }
  get ratio(): number {
    return this._scale
  }
  private _captureArea(): Area {
    return (this._area = locateOnCenter(this._image, this._offset, this._scale))
  }
  getOffset(): Point {
    return { ...this._offset }
  }
  setOffset(x: number, y: number) {
    this._offset.x = x
    this._offset.y = y
    this._captureArea()
  }
  getImageRect(viewport: Viewport): ImageRect {
    const { width, height } = viewport
    const { width: IW, height: IH } = this._image
    const SW = width / this.ratio
    const SH = height / this.ratio
    const halfW = SW / 2
    const halfH = SH / 2
    let { x, y } = this._offset
    let sx = IW / 2 - x
    let sy = IH / 2 - y
    return {
      cx: sx,
      cy: sy,
      left: sx - halfW,
      right: sx + halfW,
      top: sy - halfH,
      bottom: sy + halfH,
      width: SW,
      height: SH,
    }
  }
  replaceImageSource(source: ImageSource): ImageCacheParam | undefined {
    let cache: ImageCacheParam | undefined = undefined
    if (this._image) {
      const { _offset: center, _scale: scale, _image: image } = this
      cache = { center, scale, imageUuid: image.uuid }
    }
    this._image = source
    return cache
  }
  /**
   * It changes the scale ratio of this layer.
   * @param delta The diff from current ratio.
   */
  updateScaleBy(delta: number) {
    const scale = this._scale + delta
    this.setScale(scale)
  }
  /**
   * It changes the scale ratio of this layer.
   * @param scale The new scale ratio.
   */
  setScale(scale: number) {
    this._scale = scale // Math.max(0.1, ratio)
    this._captureArea()
  }
  private _drawCenter(ctx: CanvasRenderingContext2D) {
    ctx.save()

    {
      ctx.beginPath()
      const { x, y } = this._translateToSceen(this._offset)
      ctx.strokeStyle = 'black'
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.closePath()
    }

    ctx.restore()
  }
  draw(ctx: CanvasRenderingContext2D, area?: Area) {
    const { bitmap, x, y, width, height } = this._image
    const a = area || this._area
    const { x: sx, y: sy } = this._translateToSceen(a)
    ctx.drawImage(bitmap, x, y, width, height, sx, sy, a.width, a.height)
    this._drawCenter(ctx)
  }
  clear() {
    this._image.destroy()
  }
  static create(
    image: ImageSource,
    originResolver: CanvasOriginResolver,
    origin: Point,
    ratio: number
  ) {
    const uuid = dom.randomKey()
    return new ImageLayer(uuid, image, originResolver, origin, ratio)
  }
}
