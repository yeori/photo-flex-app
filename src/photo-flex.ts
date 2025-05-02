// Suggested code may be subject to a license. Learn more: ~LicenseLog:3840367711.
import { type PhotoFlexInitParam } from './types'
import { DndContext } from './dnd/dnd-context'
import { ImageSource } from './image-source'
import { type ScaleMode, type Viewport, type Point } from './scale'
import { dom } from './util'
import { raitioResolvers as ratioResolvers } from './scale'
import { GridRenderer } from './rendering/grid-renderer'
import { ImageDragger } from './dnd/image-drag-dnd'
import { ImageLayer } from './image-layer'
import { ActionFactory } from './view/action/action-factory'
import { type IPhotoFlexOp, PhotoFlexOp } from './photo-flex-operation'
import { EventBus } from './event/event-bus'
import { RulerView } from './view/ruler/ruler-view'
import { WheelController } from './interaction/wheel-controller'
import { PhotoFlexContext } from './photo-flex-context'
import { CanvasRenderer } from './rendering/canvas-view'
import { ModalUI } from './component/modal-ui'
import { ZoomByPinch } from './dnd/zoom-by-pinch'
import { IRenderer } from './rendering'
import { AfterImageView } from './view/after-image-view'
import { bindDimension } from './bind-dimension'
import { ParameterContext } from './view/param-context'

/**
 * Main class for photo flex.
 */
export class PhotoFlex implements Viewport {
  private _boardEl: HTMLDivElement
  private readonly _pixelRatio: number
  // private _param: Required<PhotoFlexInitParam>
  private _paramContext: ParameterContext
  private _dnd: DndContext
  private _renderers: IRenderer[] = []
  private _actionFactory: ActionFactory
  private _operator: IPhotoFlexOp
  private _eventBus: EventBus
  //@ts-ignore
  private _rulerView: RulerView
  private _wheelControl: WheelController
  private _photoFlexContext: PhotoFlexContext
  private _canvasView: CanvasRenderer
  private _afterImageView: AfterImageView
  private _modalUI?: ModalUI

  /**
   * Constructor for PhotoFlex.
   * @param el
   * @param param
   */
  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    this._eventBus = new EventBus()
    // this._param = mergeParam(DefaultInit, param) as Required<PhotoFlexInitParam>
    this._paramContext = new ParameterContext(param)
    this._operator = new PhotoFlexOp(this, this._eventBus)
    const ctx = (this._photoFlexContext = new PhotoFlexContext(
      this._operator,
      this._paramContext
    ))
    const { prefix, root } = this._paramContext.classnames
    dom.bindDataset(el, `${prefix}-${root}`, '')

    this._boardEl = dom.create<HTMLDivElement>(
      `${ctx.resolveDataName('board')}`,
      el
    )
    this._assignDimension(this._boardEl)
    dom.event.bindResizeObserver(this._boardEl, () => {
      setTimeout(() => {
        const rect = this._boardEl.getBoundingClientRect()
        let width = 0
        let height = 0
        if (this._paramContext.isResizable('width')) {
          width = rect.width
        }
        if (this._paramContext.isResizable('height')) {
          height = rect.height
        }
        // this._canvasView.resize()
        if (width > 0 || height > 0) {
          this._canvasView.setSize(width, height)
          this.repaint()
        }
      }, 0)
    })

    this._pixelRatio = self.devicePixelRatio || 1

    this._canvasView = new CanvasRenderer(
      this._boardEl,
      this._pixelRatio,
      this._photoFlexContext
    )
    this._afterImageView = new AfterImageView(this._photoFlexContext)
    this._afterImageView.bindTo(this._boardEl)

    this._dnd = new DndContext(this._canvasView.canvas, {
      translate: (_, x, y) => ({
        x: x - this.width / 2,
        y: y - this.height / 2,
      }),
    })

    this._renderers.push(this._canvasView)
    this._renderers.push(new GridRenderer(this._photoFlexContext))
    this._actionFactory = new ActionFactory(el, this._photoFlexContext)
    this._actionFactory.installActions(this._paramContext.actions)
    // this._rulerView = new RulerView(this._photoFlexContext)
    // this._rulerView.bindTo(this._boardEl)
    this._wheelControl = new WheelController(this._photoFlexContext)
    this._wheelControl.bindTo(this._boardEl)
    this._dnd.addDragListener(new ImageDragger(this))
    this._dnd.addPinchListener(new ZoomByPinch(this))

    this.installUI(el)
    this.bindDropdownListener(el)
  }
  get width() {
    return this._canvasView.width
  }

  get height() {
    return this._canvasView.height
  }

  get scaleMode(): ScaleMode {
    const { scaleMode: initialZoom } = this._paramContext
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
  private _assignDimension(el: HTMLElement) {
    const { width, height } = this._paramContext.size
    const widthValue = this._paramContext.getWidth()
    bindDimension(el, 'width', width)
    if (this._paramContext.isResizable('width')) {
      el.style.flex = `0 1 ${widthValue}`
    } else {
      el.style.flex = `0 0 ${widthValue}`
    }
    const heightValue = this._paramContext.getHeight()
    if (this._paramContext.isResizable('height')) {
      dom.style(el, {
        height: '100%',
        maxHeight: heightValue,
      })
    } else {
      bindDimension(el, 'height', height)
    }
  }
  private installUI(container: HTMLElement) {
    customElements.define('modal-ui', ModalUI)
    const modal = new ModalUI(this._operator)
    modal.bindTo(container)
    this._modalUI = modal
  }
  /**
   * handles drag event to catch and render dropped image file.
   * @param el
   */
  private bindDropdownListener(el: HTMLElement) {
    let unsub: (() => void) | undefined = undefined
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      console.log('[DRAG ENTER]', event.target)
      const { target, currentTarget } = event
      if (target !== currentTarget) {
        console.log('skip')
        return
      }
      // Check if the dragged items contain files
      if (event.dataTransfer?.types.includes('Files')) {
        const dropEl = dom.createFromHtml(
          '<div data-photoflex-dropzone>Drop files here</div>'
        )
        dropEl.style.pointerEvents = 'none'
        if (!unsub) {
          unsub = dom.appends(el, dropEl)
        }
      }
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const { target, currentTarget } = event
      if (target !== currentTarget) {
        return
      }
      console.log('[DRAG OVER]')
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy'
      }
    }

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const { target } = event
      if (target !== el) {
        return
      }
      console.log('[DRAG LEAVE]', target)

      const relatedTarget = event.relatedTarget as Node | null
      if (!relatedTarget || !el.contains(relatedTarget)) {
        unsub?.()
        unsub = undefined
      }
    }

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      unsub?.()
      unsub = undefined
      console.log('[DROP]')

      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0]
        console.log(`File dropped: ${file.name}, type: ${file.type}`)

        if (file.type.startsWith('image/')) {
          try {
            this.operator.openImage(file)
          } catch (error) {
            console.error('Error opening dropped image:', error)
          }
        } else {
          console.warn('Dropped file is not an image:', file.type)
        }
        event.dataTransfer.clearData()
      } else {
        console.log('No files found in drop event dataTransfer.')
      }
    }

    // Attach listeners
    el.addEventListener('dragenter', handleDragEnter)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('drop', handleDrop)

    console.log('Dropdown listeners bound to element:', el)

    // Return a dispose function to remove listeners if needed
    const dispose = () => {
      el.removeEventListener('dragenter', handleDragEnter)
      el.removeEventListener('dragover', handleDragOver)
      el.removeEventListener('dragleave', handleDragLeave)
      el.removeEventListener('drop', handleDrop)
      unsub?.()
      console.log('Dropdown listeners removed from element:', el)
    }

    return { dispose }
  }

  getLayers(): ImageLayer[] {
    return this._canvasView.getLayers()
  }

  getLayerOrigins(): Point[] {
    return this._canvasView.getLayerOrigins()
  }

  setLayerOrigin(index: number, cx: number, cy: number): void {
    this._canvasView.setLayerOrigin(index, cx, cy)
    const layer = this._canvasView.getFirstLayer()
    if (layer) {
      const { width, height } = layer.image
      this._eventBus.emit('move', {
        cx,
        cy,
        width,
        height,
        layer: layer.uuid,
      })
    }
  }
  /**
   * resize canvas size
   */
  resizeViewport(width: number, height: number) {
    this._paramContext.setSize(width, height)
    this._assignDimension(this._boardEl)
    this._canvasView.resize()
    this.repaint()
    let image: ImageSource | undefined = undefined
    if (this._canvasView.hasLayers()) {
      image = this._canvasView.getFirstLayer()!.image
    }
    this._eventBus.emit('viewport:resize', {
      width: width,
      height: height,
      image,
    })
  }

  repaint() {
    this._canvasView.clear()
    this._renderers.forEach((rendering) => {
      rendering.render(this._canvasView.ctx)
    })
  }
  /**
   * calcuates ratio
   */
  private _calculateRatio(source: ImageSource, scaleMode?: ScaleMode): number {
    // use scaleMode to resolve ratio
    scaleMode = scaleMode || this.scaleMode
    // const { scaleMode } = this
    return scaleMode === 'custom'
      ? this._paramContext.ratio
      : ratioResolvers[scaleMode](source, this)
  }
  async setImage(file: File, clear: boolean = true): Promise<void> {
    const source = await ImageSource.fromFile(file)
    const ratio: number = this._calculateRatio(source)
    const origin = { x: 0, y: 0 }
    const layer = ImageLayer.create(
      source,
      this._canvasView.originReslover,
      origin,
      ratio
    )
    if (clear) {
      this._canvasView.removeLayers()
    }
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
  private _updateZoom(
    zommResolver: (layer: ImageLayer) => { ratio: number; origin?: Point }
  ) {
    this._canvasView.getLayers().forEach((layer) => {
      const { ratio, origin } = zommResolver(layer)
      const { uuid } = layer
      layer.setRatio(ratio)
      this._eventBus.emit('zoom', {
        ratio,
        layer: uuid,
      })
      if (origin) {
        layer.setOrigin(origin.x, origin.y)
        const { width, height } = layer.image
        this._eventBus.emit('move', {
          cx: origin.x,
          cy: origin.y,
          width,
          height,
          layer: uuid,
        })
      }
    })
    this.repaint()
  }
  updateZoomBy(zoomDelta: number): void {
    this._updateZoom((layer) => ({
      ratio: layer.ratio + zoomDelta,
    }))
  }
  setZoom(zoom: number): void {
    this._updateZoom(() => ({
      ratio: zoom,
    }))
  }
  fitBy(scale: 'cover' | 'contain') {
    const origin = { x: 0, y: 0 } as Point
    this._updateZoom((layer) => ({
      ratio: this._calculateRatio(layer.image, scale),
      origin,
    }))
  }
  fitToRealSize(): void {
    const realSize = { ratio: 1, origin: { x: 0, y: 0 } }
    this._updateZoom(() => realSize)
  }
  getLayer(layerUuid: string): ImageLayer {
    const layer = this._canvasView
      .getLayers()
      .find((layer) => layer.uuid === layerUuid)
    if (!layer) {
      throw new Error(`layer not found.[${layerUuid}]`)
    }
    return layer
  }
  dispose() {
    this._dnd.release()
  }
  /**
   * capture current viewport
   */
  async capture() {
    const { imageURL, name } = await this._canvasView.capture()
    const link = document.createElement('a')
    link.href = imageURL
    link.download = name
    link.click()
  }
  async captureBy(type: 'dataurl'): Promise<string> {
    if (type === 'dataurl') {
      const { imageURL } = await this._canvasView.capture()
      return imageURL
    } else {
      throw new Error('check capture type: ' + type)
    }
  }
  static init(el: HTMLElement, param?: PhotoFlexInitParam): IPhotoFlexOp {
    const flex = new PhotoFlex(el, param)
    return flex.operator
  }
}
export * from './types'
export * from './rendering'
export { ImageLayer, ImageSource, IPhotoFlexOp, ScaleMode, Viewport, Point }
export * from './event'
