import { IRenderer, PhotoFlexInitParam } from '.'
import { DndContext } from './dnd/dnd-context'
import { ImageSource } from './image-source'
import { ScaleMode } from './scale'
import { dom } from './util'

import { raitioResolvers } from './scale'
import { GridRenderer } from './rendering/grid-renderer'
import { ImageDragger } from './dnd/image-drag-dnd'
import { ImageLayer } from './image-layer'

const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  zoom: 'contain',
  loadContext: (canvas) => canvas.getContext('2d')!,
}
/**
 * image editor panel
 */
export class PhotoFlex {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _layers: ImageLayer[] = []
  private readonly _pixelRatio: number
  private _param: PhotoFlexInitParam
  private _dnd: DndContext
  private _renderers: IRenderer[] = []

  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    let canvasEl = dom.findOne<HTMLCanvasElement>(el, 'canvas')
    this._canvas = canvasEl || dom.create('canvas', el)
    this._pixelRatio = self.devicePixelRatio || 1
    this._param = param || DefaultInit
    this._ctx = this.resize(this._canvas, this._param)
    this._renderers.push(new GridRenderer())
    this._dnd = new DndContext(this._canvas, {
      translate: (_, x, y) => ({
        x: x - this.width / 2,
        y: y - this.height / 2,
      }),
    })
    // this._dnd.addListener({
    //   before(e) {
    //     console.log(`start(${e.sx}, ${e.sy})`)
    //   },
    //   dragging(e) {
    //     console.log(`start(${e.sx}, ${e.sy}) delta (${e.dx}, ${e.dy})`)
    //   },
    //   end(e) {
    //     console.log(`start(${e.sx}, ${e.sy}) end (${e.sy + e.dy})`)
    //   },
    // })
    this._dnd.addListener(new ImageDragger(this))
  }
  get width() {
    return this._canvas.width / this._pixelRatio
  }
  get height() {
    return this._canvas.height / this._pixelRatio
  }
  get scaleMode(): ScaleMode {
    const { zoom: initialZoom } = this._param
    if (initialZoom === 'cover') {
      return 'cover'
    } else if (initialZoom === 'contain') {
      return 'contain'
    } else {
      return 'custom'
    }
  }
  get layers(): ImageLayer[] {
    return this._layers
  }
  get imageSources(): ImageSource[] {
    return this._layers.map((layer) => layer.image)
  }
  private resize(canvas: HTMLCanvasElement, param: PhotoFlexInitParam) {
    const [w, wUnit] = dom.parseUnit(param.width || DefaultInit.width)
    const [h, hUnit] = dom.parseUnit(param.height || DefaultInit.height)
    const width = w * this._pixelRatio
    const height = h * this._pixelRatio
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${w}${wUnit}`
    canvas.style.height = `${h}${hUnit}`
    const ctx = (param.loadContext || DefaultInit.loadContext)(canvas)
    ctx.scale(this._pixelRatio, this._pixelRatio)
    return ctx
  }
  repaint() {
    this._ctx.clearRect(0, 0, this.width, this.height)
    this._layers.forEach((layer) => {
      layer.draw(this._ctx)
    })
    this._renderers.forEach((rendering) => {
      rendering.render(this._ctx, this)
    })
  }
  /**
   * draw the image file on the canvas.
   * @param file image file to be drawn on canvas
   */
  async setImage(file: File) {
    const source = await ImageSource.fromFile(file)
    const { scaleMode } = this
    const ratio: number =
      scaleMode === 'custom'
        ? (this._param.zoom as number)
        : raitioResolvers[scaleMode](source, this)
    const { width, height } = this
    const origin = { x: width / 2, y: height / 2 }
    const layer = ImageLayer.create(source, origin, ratio)

    this._layers.push(layer)
    this.repaint()
  }
}
