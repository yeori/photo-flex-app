import { ImageSource } from './image-source'
import { locateOnCenter } from './locator/locate-on-center'
import { Point, Area } from './scale'

/**
 * It represents layer of image.
 */
export class ImageLayer {
  private _area: Area
  private constructor(
    private _image: ImageSource,
    private _origin: Point,
    private _ratio: number
  ) {
    this._area = locateOnCenter(this._image, this._origin, this._ratio)
  }
  get image(): ImageSource {
    return this._image
  }
  get renderingSpec(): Area {
    return Object.assign({}, this._area)
  }
  setPosition(x: number, y: number) {
    const { _area: spec } = this
    if (!spec) {
      throw new Error('not initialized', { cause: 'NOT_INITIALIZED' })
    }
    spec.x = x
    spec.y = y
  }
  draw(ctx: CanvasRenderingContext2D) {
    const { bitmap, x, y, width, height } = this._image
    const { _area: a } = this
    ctx.drawImage(bitmap, x, y, width, height, a.x, a.y, a.width, a.height)
  }

  static create(image: ImageSource, origin: Point, ratio: number) {
    return new ImageLayer(image, origin, ratio)
  }
}
