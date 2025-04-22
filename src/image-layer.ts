import { ImageSource } from './image-source'
import { locateOnCenter } from './locator/locate-on-center'
import { CanvasOriginResolver } from './rendering/canvas-view'
import { Point, Area } from './scale'
import { dom } from './util'

/**
 * It represents layer of image.
 */
export class ImageLayer {
  private _area: Area
  private constructor(
    public readonly uuid: string,
    private _image: ImageSource,
    private readonly _resolveOrigin: CanvasOriginResolver,
    private _origin: Point,
    private _ratio: number
  ) {
    this._area = this._captureArea()
  }
  get image(): ImageSource {
    return this._image
  }
  get ratio(): number {
    return this._ratio
  }
  private _captureArea(): Area {
    return (this._area = locateOnCenter(this._image, this._origin, this._ratio))
  }
  getOrigin(): Point {
    return { ...this._origin }
  }
  setOrigin(x: number, y: number) {
    this._origin.x = x
    this._origin.y = y
    this._captureArea()
  }
  /**
   * It changes the scale ratio of this layer.
   * @param delta The diff from current ratio.
   */
  updateRatioBy(delta: number) {
    const newRatio = this._ratio + delta
    this.setRatio(newRatio)
  }
  /**
   * It changes the scale ratio of this layer.
   * @param ratio The new scale ratio.
   */
  setRatio(ratio: number) {
    this._ratio = Math.max(0.1, ratio)
    this._captureArea()
  }
  draw(ctx: CanvasRenderingContext2D) {
    const { bitmap, x, y, width, height } = this._image
    const { _area: a } = this
    const { x: cx, y: cy } = this._resolveOrigin(this._area)
    ctx.drawImage(bitmap, x, y, width, height, cx, cy, a.width, a.height)
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
