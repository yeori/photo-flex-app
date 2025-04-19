import { IRenderer, PhotoFlexInitParam } from '.'
import { DndContext } from './dnd/dnd-context'
import { ImageSource } from './image-source'
import { ScaleMode, Viewport, type Point } from './scale'
import { dom } from './util'
import { raitioResolvers as ratioResolvers } from './scale'
import { GridRenderer } from './rendering/grid-renderer'
import { ImageDragger } from './dnd/image-drag-dnd'
import { ImageLayer } from './image-layer'
import { ActionFactory } from './view/action/action-factory'
import { mergeParam } from './merge-param'
import { type IPhotoFlexOp, PhotoFlexOp } from './photo-flex-operation'
import { EventBus } from './event/event-bus'
import { RulerView } from './view/ruler/ruler-view'
import { WheelController } from './interaction/wheel-controller'
import { PhotoFlexContext } from './photo-flex-context'
import { CanvasRenderer } from './rendering/canvas-view'
import { ModalUI } from './component/modal-ui'

const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  zoom: 'contain',
  wheelSensitivity: 0.002,
  actions: ['move', 'resize', 'zoom'],
  classnames: {
    prefix: 'photo-flex',
    root: '-root',
    canvas: '-canvas',
    toolbar: '-toolbar',
  },
  loadContext: (canvas) => canvas.getContext('2d')!,
}

/**
 * Main class for photo flex.
 */
export class PhotoFlex implements Viewport {
  private _boardEl: HTMLDivElement
  private readonly _pixelRatio: number
  private _param: Required<PhotoFlexInitParam>
  private _dnd: DndContext
  private _renderers: IRenderer[] = []
  private _actionFactory: ActionFactory
  private _operator: IPhotoFlexOp
  private _eventBus: EventBus
  private _rulerView: RulerView
  private _wheelControl: WheelController
  private _photoFlexContext: PhotoFlexContext
  private _canvasView: CanvasRenderer
  private _modalUI?: ModalUI

  /**
   * Constructor for PhotoFlex.
   * @param el
   * @param param
   */
  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    this._param = mergeParam(DefaultInit, param) as Required<PhotoFlexInitParam>
    const { prefix, root } = this._param.classnames!
    dom.bindDataset(el, `${prefix}${root}`, '')
    this._boardEl = dom.create<HTMLDivElement>(
      '.ruler[data-photo-flex-board]',
      el
    )
    this._pixelRatio = self.devicePixelRatio || 1
    this._canvasView = new CanvasRenderer(
      this._boardEl,
      this._pixelRatio,
      this._param
    )
    this._dnd = new DndContext(this._canvasView.canvas, {
      translate: (_, x, y) => ({
        x: x - this.width / 2,
        y: y - this.height / 2,
      }),
    })
    this._eventBus = new EventBus()
    this._operator = new PhotoFlexOp(this, this._eventBus)
    this._photoFlexContext = new PhotoFlexContext(
      this._operator,
      this._param,
      DefaultInit
    )
    this._renderers.push(this._canvasView)
    this._renderers.push(new GridRenderer(this._photoFlexContext))
    this._actionFactory = new ActionFactory(el, this._photoFlexContext)
    this._actionFactory.installActions(this._param.actions || [])
    this._rulerView = new RulerView(this._photoFlexContext)
    this._rulerView.bindTo(this._boardEl)
    this._wheelControl = new WheelController(this._photoFlexContext)
    this._wheelControl.bindTo(this._boardEl)
    this._dnd.addListener(new ImageDragger(this))

    this.installUI(el)
  }
  get width() {
    return this._canvasView.width
  }

  get height() {
    return this._canvasView.height
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
  get operator(): IPhotoFlexOp {
    return this._operator
  }
  get modalUI() {
    if (!this._modalUI) {
      throw new Error('modal ui is not initialized')
    }
    return this._modalUI
  }
  private installUI(container: HTMLElement) {
    customElements.define('modal-ui', ModalUI)
    const modal = new ModalUI(this._operator)
    modal.bindTo(container)
    this._modalUI = modal
  }

  getLayers(): ImageLayer[] {
    return this._canvasView.getLayers()
  }

  getLayerOrigins(): Point[] {
    return this._canvasView.getLayerOrigins()
  }

  setLayerOrigin(index: number, x: number, y: number): void {
    this._canvasView.setLayerOrigin(index, x, y)
  }
  /**
   * resize canvas size
   */
  resizeViewport(width: number, height: number) {
    this._param.width = `${width}px`
    this._param.height = `${height}px`
    this._canvasView.resize()
    this.repaint()
  }

  repaint() {
    this._canvasView.clear()
    this._renderers.forEach((rendering) => {
      rendering.render(this._canvasView.ctx)
    })
  }

  async setImage(file: File) {
    const source = await ImageSource.fromFile(file)
    const { scaleMode } = this
    const ratio: number =
      scaleMode === 'custom'
        ? (this._param.zoom as number)
        : ratioResolvers[scaleMode](source, this)
    const { width, height } = this
    const origin = { x: width / 2, y: height / 2 }
    const layer = ImageLayer.create(source, origin, ratio)
    this._canvasView.addLayer(layer)
    this.repaint()
    this._eventBus.emit('open', {
      image: source,
      ratio,
    })
  }

  getZoomLevel(): number {
    const firstLayer = this._canvasView.getFirstLayer()
    return firstLayer ? firstLayer.ratio : -1
  }

  updateZoomBy(zoomDelta: number): void {
    this._canvasView.updateLayerRatiosBy(zoomDelta)
    this.repaint()
    const firstLayer = this._canvasView.getFirstLayer()
    if (firstLayer) {
      this._eventBus.emit('zoom', {
        zoom: firstLayer.ratio,
        layer: firstLayer.uuid,
      })
    }
  }

  setZoom(zoom: number): void {
    this._canvasView.setLayerRatios(zoom)
    this.repaint()
    const firstLayer = this._canvasView.getFirstLayer()
    if (firstLayer) {
      this._eventBus.emit('zoom', {
        zoom: firstLayer.ratio,
        layer: firstLayer.uuid,
      })
    }
  }
}
