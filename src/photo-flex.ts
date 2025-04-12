import { IRenderer, PhotoFlexInitParam } from '.'
import { DndContext } from './dnd/dnd-context'
import { ImageSource } from './image-source'
import { ScaleMode } from './scale'
import { dom } from './util'

import { scalers } from './scale'
import { GridRenderer } from './rendering/grid-renderer'
import { ImageDragger } from './dnd/image-drag-dnd'

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
  private _sources: ImageSource[] = []
  private readonly _ratio: number
  private _param: PhotoFlexInitParam
  private _dnd: DndContext
  private _renderers: IRenderer[] = []

  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    let canvasEl = dom.findOne<HTMLCanvasElement>(el, 'canvas')
    this._canvas = canvasEl || dom.create('canvas', el)
    this._ratio = self.devicePixelRatio || 1
    this._param = param || DefaultInit
    this._ctx = this.resize(this._canvas, this._param)
    this._ctx.fillRect(0, 0, this.width, this.height)
    this._renderers.push(new GridRenderer())
    //@ts-ignore
    this._source = new ImageSource(undefined, {
      name: 'dummy',
      size: 0,
      type: 'image/png',
    })
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
    return this._canvas.width / this._ratio
  }
  get height() {
    return this._canvas.height / this._ratio
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
  get imageSources(): ImageSource[] {
    return this._sources
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
    const ctx = (param.loadContext || DefaultInit.loadContext)(canvas)
    ctx.scale(this._ratio, this._ratio)
    return ctx
  }
  repaint() {
    this._ctx.clearRect(0, 0, this.width, this.height)
    this._sources.forEach((source) => {
      source.draw(this._ctx)
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
    const scaler = scalers[scaleMode]
    const spec = scaler(source, this)
    source.setRenderingSpec(spec)
    this._sources.push(source)
    this.repaint()
  }
}
