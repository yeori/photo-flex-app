import { ImageSource } from './image-source'
import { dom } from './util'
import { scalers } from './scale'
export * from './scale'

/**
 * css selector syntax to
 */
export type CssSelector = string
/**
 * initial configuration paraters
 */
export type PhotoFlexInitParam = {
  /**
   * width of image editor canvas
   * @default "400px"
   */
  width?: string
  /**
   * height of image editor canvas
   * @default "400px"
   */
  height?: string
  /**
   * initial zoom level of image,
   * zoom is the css zoom property
   * e.g. "100%" means 1:1 zoom, "contain" means zoom to fit the editor, "cover" means zoom to cover the editor
   * @default "contain"
   */
  initialZoom?: `${number}%` | 'contain' | 'cover'

  loadContext?: (canvas: HTMLCanvasElement) => CanvasRenderingContext2D
}
const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  initialZoom: 'contain',
  loadContext: (canvas) => canvas.getContext('2d')!,
}

/**
 * image editor panel
 */
export class PhotoFlex {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _source: ImageSource
  private readonly _ratio: number
  private _param: PhotoFlexInitParam

  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    let canvasEl = dom.findOne<HTMLCanvasElement>(el, 'canvas')
    this._canvas = canvasEl || dom.create('canvas', el)
    this._ratio = self.devicePixelRatio || 1
    this._param = param || DefaultInit
    this._ctx = this.resize(this._canvas, this._param)
    this._ctx.fillRect(0, 0, this.width, this.height)
    //@ts-ignore
    this._source = new ImageSource(undefined, {
      name: 'dummy',
      size: 0,
      type: 'image/png',
    })
  }
  get width() {
    return this._canvas.width
  }
  get height() {
    return this._canvas.height
  }
  get canvasWidth() {
    return this._canvas.width / this._ratio
  }
  get canvasHeight() {
    return this._canvas.height / this._ratio
  }
  get zoomMode(): 'cover' | 'contain' | 'custom' {
    const { initialZoom } = this._param
    if (initialZoom === 'cover') {
      return 'cover'
    } else if (initialZoom === 'contain') {
      return 'contain'
    } else {
      return 'custom'
    }
  }
  private resize(canvas: HTMLCanvasElement, param: PhotoFlexInitParam) {
    const [w, wUnit] = dom.parseUnit(param.width || DefaultInit.width)
    const [h, hUnit] = dom.parseUnit(param.height || DefaultInit.height)
    const width = w * this._ratio
    const height = h * this._ratio
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${w}${wUnit}`
    canvas.style.height = `${h}${hUnit}`
    return canvas.getContext('2d')!
  }
  /**
   * draw the image file on the canvas.
   * @param file image file to be drawn on canvas
   */
  async setImage(file: File) {
    this._source = await ImageSource.fromFile(file)
    const { bitmap } = this._source
    const { zoomMode } = this
    const scaler = scalers[zoomMode]
    const { subject: s, view: v } = scaler(this._source, this)
    this._ctx.drawImage(
      bitmap,
      s.x,
      s.y,
      s.width,
      s.height,
      v.x,
      v.y,
      v.width,
      v.height
    )
  }
}
