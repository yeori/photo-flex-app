import { ImageSource } from './image-source'
import { locateOnCenter } from './locator/locate-on-center'
import { CanvasOriginResolver } from './rendering/canvas-view'
import { Point, Area, ImageCacheParam } from './scale'
import { dom } from './util'

/**
 * It represents layer of image.
 */
export class ImageLayer {
  private _area: Area
  private constructor(
    public readonly uuid: string,
    private _image: ImageSource,
    private readonly _translateToSceen: CanvasOriginResolver,
    /**
     * logical center of this layer, relative to center of viewport.
     */
    private _center: Point,
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
    return (this._area = locateOnCenter(this._image, this._center, this._scale))
  }
  getCenter(): Point {
    return { ...this._center }
  }
  setCenter(x: number, y: number) {
    this._center.x = x
    this._center.y = y
    this._captureArea()
  }
  replaceImageSource(source: ImageSource): ImageCacheParam | undefined {
    let cache: ImageCacheParam | undefined = undefined
    if (this._image) {
      const { _center: center, _scale: scale, _image: image } = this
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
      const { x, y } = this._translateToSceen(this._center)
      ctx.strokeStyle = 'black'
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.closePath()
    }

    ctx.restore()
  }
  draw(ctx: CanvasRenderingContext2D) {
    const { bitmap, x, y, width, height } = this._image
    const { _area: a } = this
    const { x: sx, y: sy } = this._translateToSceen(this._area)
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
