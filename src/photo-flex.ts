import { type PhotoFlexInitParam } from './types'
import { DndContext } from './dnd/dnd-context'
import { ImageSource } from './image-source'
import { type ScaleMode, type Viewport, type Point } from './scale'
import { dom } from './util'
import { raitioResolvers as ratioResolvers } from './scale'
import { ImageDragger } from './dnd/image-drag-dnd'
import { ImageLayer } from './image-layer'
import { ActionFactory } from './view/action/action-factory'
import { type IPhotoFlexOp, PhotoFlexOp } from './photo-flex-operation'
import { EventBus } from './event/event-bus'
import { WheelController } from './interaction/wheel-controller'
import { PhotoFlexContext } from './photo-flex-context'
import { CanvasRenderer } from './rendering/canvas-view'
import { ModalUI } from './component/modal-ui'
import { ZoomByPinch } from './dnd/zoom-by-pinch'
import { GridRenderer, GridRenderParam, IRenderer } from './rendering'
import { bindDimension } from './bind-dimension'
import { ParameterContext } from './view/param-context'
import { CaptureEvent } from './event'
import { SourceManager } from './source-manager'
import { type TooltipView } from './view/tooltip/tooltip-view'
import { OpenImageSourceAction } from './view/action/action-open-image-source'
import { TooltipData } from './view/tooltip/tooltip-data'
import { ViewHandler } from './view/view-handler'

/**
 * Main class for photo flex.
 */
export class PhotoFlex implements Viewport {
  private _boardEl: HTMLDivElement
  private readonly _pixelRatio: number
  private _paramContext: ParameterContext
  private _dnd: DndContext
  private _renderers: IRenderer[] = []
  private _actionFactory: ActionFactory
  private _operator: IPhotoFlexOp
  private _eventBus: EventBus
  private _wheelControl: WheelController
  private _photoFlexContext: PhotoFlexContext
  private _canvasView: CanvasRenderer
  private readonly _viewHandle: ViewHandler
  private _modalUI?: ModalUI
  private _sourceManager: SourceManager // Add SourceManager
  private _scaleForExport: number = 1

  private _tooltip: TooltipData

  /**
   * Constructor for PhotoFlex.
   * @param el
   * @param param
   */
  constructor(el: HTMLElement, param?: PhotoFlexInitParam) {
    this._eventBus = new EventBus()
    this._paramContext = new ParameterContext(param)
    this._operator = new PhotoFlexOp(this, this._eventBus)
    const ctx = (this._photoFlexContext = new PhotoFlexContext(
      this,
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

    this._pixelRatio = self.devicePixelRatio || 1

    this._canvasView = new CanvasRenderer(
      this._boardEl,
      this._pixelRatio,
      this._photoFlexContext,
      Object.freeze({
        name: 'canvas',
        order: 1024,
      })
    )
    this._viewHandle = new ViewHandler(this._photoFlexContext)
    this._viewHandle.installView(this._boardEl, el)

    this._dnd = new DndContext(this._canvasView.canvas, {
      translate: (_, x, y) => ({
        x: x - this.width / 2,
        y: y - this.height / 2,
      }),
    })

    this.installRenderers()
    this._actionFactory = new ActionFactory(el, this._photoFlexContext)
    this._actionFactory.installActions(this._paramContext.actions)
    this._wheelControl = new WheelController(this._photoFlexContext)
    this._wheelControl.bindTo(this._boardEl)
    this._sourceManager = new SourceManager(this._photoFlexContext)
    this._dnd.addDragListener(new ImageDragger(this))
    this._dnd.addPinchListener(new ZoomByPinch(this))

    this._tooltip = this._viewHandle
      .getView<TooltipView>('tooltip-view')
      .createTooltip(this._canvasView.canvas, 'ready', 'center', 0, 400)
    dom.event.bindResizeObserver(this._boardEl, () => {
      this._tooltip.show()
      setTimeout(() => {
        this._handleResize()
        this._tooltip.setText(`${this.width}x${this.height}`)
        this._tooltip.hide()
      }, 10)
    })
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
  private _resolveScaleForExport(width: number, height: number) {
    // const outer = el.parentElement!.getBoundingClientRect()
    return Math.min(1, height / width)
  }
  private _handleResize() {
    const rect = this._boardEl.getBoundingClientRect()
    let width = 0
    let height = 0
    if (this._paramContext.isResizable('width')) {
      width = rect.width
    } else {
      width = this._paramContext.getWidth()[0]
    }
    if (this._paramContext.isResizable('height')) {
      height = rect.height
    } else {
      height = this._paramContext.getHeight()[0]
    }
    if (width > 0 || height > 0) {
      this._canvasView.setSize(width, height)
      this.repaint()
    }
  }
  private _assignDimension(el: HTMLElement) {
    const { width } = this._paramContext.size
    const [pixelWidth] = this._paramContext.getWidth()
    const [pixelHeight, hUnit] = this._paramContext.getHeight()
    this._scaleForExport = this._resolveScaleForExport(pixelWidth, pixelHeight)
    console.log(this._scaleForExport)
    const widthResizable = this._paramContext.isResizable('width')
    const heightResizable = this._paramContext.isResizable('height')
    if (this._canvasView) {
      this._canvasView.canvas.style.display = 'none'
    }
    if (!widthResizable && !heightResizable) {
      dom.style(el, {
        aspectRatio: `${pixelWidth} / ${pixelHeight}`,
      })
    } else {
      dom.style(el, {
        aspectRatio: 'auto',
      })
    }
    bindDimension(el, 'width', width)
    if (widthResizable) {
      el.style.flex = `0 1 auto`
    } else {
      el.style.flex = `0 0 auto`
    }

    if (heightResizable) {
      dom.style(el, {
        height: '100%',
        maxHeight: `${pixelHeight}${hUnit}`,
      })
    } else {
      dom.style(el, {
        height: `${pixelHeight}px`,
      })
      setTimeout(() => {
        el.style.height = ''
      }, 10)
    }
    if (this._canvasView) {
      this._canvasView.canvas.style.display = ''
    }
  }
  private installRenderers() {
    this._renderers.push(this._canvasView)
    const { renderers } = this._paramContext
    renderers.forEach((param) => {
      if (param.name === 'grid') {
        this._renderers.push(
          new GridRenderer(this._photoFlexContext, param as GridRenderParam)
        )
      } else {
        throw new Error(`invalid renderer. name: ${param.name}`)
      }
    })
  }
  private installUI(container: HTMLElement) {
    customElements.define('modal-ui', ModalUI)
    const modal = new ModalUI(this._operator)
    modal.bindTo(container)
    this._modalUI = modal

    if (this._viewHandle.isUsing('image-source-view')) {
      new OpenImageSourceAction(this._photoFlexContext).bindTo(container)
    }
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

      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const files = Array.from(event.dataTransfer.files)
        this.setImage(files) // Use openImage with File[]
        event.dataTransfer.clearData()
      } else {
        console.log('No files found in drop event dataTransfer.')
      }
    }

    el.addEventListener('dragenter', handleDragEnter)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('drop', handleDrop)

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
      width,
      height,
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
   * calcuates scale
   */
  private _calculateScale(source: ImageSource, scaleMode?: ScaleMode): number {
    scaleMode = scaleMode || this.scaleMode
    return scaleMode === 'custom'
      ? this._paramContext.ratio
      : ratioResolvers[scaleMode](source, this)
  }
  public setActiveImage(imageUuid: string) {
    const source = this._sourceManager.getSourceBy(
      (image) => image.uuid === imageUuid
    )
    const layer = this._canvasView.getFirstLayer()
    let ratio: number = 1
    if (layer) {
      const center = layer.getCenter()
      let { image, ratio: _ratio } = layer
      this._sourceManager.write({
        imageUuid: image.uuid,
        center,
        scale: _ratio,
      })
      layer.replaceImageSource(source)
      const param = this._sourceManager.setActiveSource(source)
      if (param) {
        const { center, scale } = param
        layer.setScale(scale)
        layer.setCenter(center.x, center.y)
        ratio = scale
        this._eventBus.emit('move', {
          cx: center.x,
          cy: center.y,
          width: source.width,
          height: source.height,
          layer: layer.uuid,
        })
        this._eventBus.emit('zoom', {
          ratio: ratio,
          layer: layer.uuid,
        })
      }
    } else {
      ratio = this._calculateScale(source)
      const layer = ImageLayer.create(
        source,
        this._canvasView.originReslover,
        { x: 0, y: 0 },
        ratio
      )
      this._canvasView.addLayer(layer)
    }
    this.repaint()
    this._eventBus.emit('source', {
      type: 'activated',
      sources: [source],
    })
    this._eventBus.emit('open', {
      image: source,
      ratio,
    })
  }
  private async _fileToImage(files: File[]) {
    const sources: ImageSource[] = []
    for (const file of files) {
      try {
        const source = await ImageSource.fromBlob(file, file.name)
        sources.push(source)
      } catch (error) {
        console.error(
          `PhotoFlex.setImage: Error processing file ${file.name}:`,
          error
        )
      }
    }
    return sources
  }
  async setImage(files: File[], clear: boolean = true): Promise<void> {
    if (!files || files.length === 0) {
      console.warn('PhotoFlex.setImage: No files provided.')
      return
    }

    const sources: ImageSource[] = await this._fileToImage(files)
    if (sources.length === 0) {
      console.warn('PhotoFlex.setImage: No valid image files provided.')
      return
    }
    this._sourceManager.addSources(sources, files)

    for (const source of sources) {
      this._sourceManager.write({
        imageUuid: source.uuid,
        center: { x: 0, y: 0 },
        scale: this._calculateScale(source),
      })
    }

    const source = sources[0]
    // const ratio: number = this._calculateScale(source)
    // const origin = { x: 0, y: 0 }
    const { center: origin, scale: ratio } = this._sourceManager.read(
      source.uuid
    )!
    this._sourceManager.setActiveSource(source)

    if (clear) {
      this._canvasView.removeLayers()
    }
    if (this._canvasView.isEmpty()) {
      const layer = ImageLayer.create(
        source,
        this._canvasView.originReslover,
        origin,
        ratio
      )
      this._canvasView.addLayer(layer)
    }
    this.repaint()
    this._eventBus.emit('source', {
      type: 'activated',
      sources,
    })
    this._eventBus.emit('open', {
      image: source,
      ratio,
    })
  }
  async removeImageByUuid(
    uuid: string,
    activeImageUuid?: string
  ): Promise<boolean> {
    const imageToDel = this._sourceManager.getSourceBy(
      (image) => image.uuid === uuid
    )
    this._sourceManager.removeSource(imageToDel.uuid)
    if (activeImageUuid) {
      this.setActiveImage(activeImageUuid)
    } else {
      this._canvasView.removeLayerBy((_layer) => _layer.image.uuid === uuid)
    }
    this.repaint()
    return Promise.resolve(true)
  }
  getZoomLevel(): number {
    const firstLayer = this._canvasView.getFirstLayer()
    return firstLayer ? firstLayer.ratio : -1
  }
  private _updateZoom(
    scaleResolver: (layer: ImageLayer) => { ratio: number; origin?: Point }
  ) {
    this._canvasView.getLayers().forEach((layer) => {
      let { ratio, origin } = scaleResolver(layer)
      const { uuid } = layer
      const newRatio = this._paramContext.resolveScale(ratio)
      if (!origin) {
        const scale = newRatio / layer.ratio
        origin = layer.getCenter()
        origin.x *= scale
        origin.y *= scale
      }
      layer.setScale(newRatio)
      layer.setCenter(origin.x, origin.y)
      this._tooltip.setText((100 * newRatio).toFixed(1) + '%')
      this._tooltip.show(500)
      this._eventBus.emit('zoom', {
        ratio,
        layer: uuid,
      })
      const { width, height } = layer.image
      this._eventBus.emit('move', {
        cx: origin.x,
        cy: origin.y,
        width,
        height,
        layer: uuid,
      })
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
    const center = { x: 0, y: 0 } as Point
    this._updateZoom((layer) => ({
      ratio: this._calculateScale(layer.image, scale),
      origin: center,
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
  setCursor(cursorName: string) {
    this._canvasView.setCursor(cursorName)
  }
  dispose() {
    this._dnd.release()
  }
  /**
   * download current viewport
   */
  async download() {
    const { image, name } = await this._capture('dataurl')
    const link = document.createElement('a')
    link.href = image
    link.download = name
    link.click()
  }
  private async _capture(type: 'dataurl'): Promise<CaptureEvent> {
    const { imageURL, name } = await this._canvasView.capture()
    const length = dom.image.inferSize(imageURL)
    const fileName = this._paramContext.resolveFileName(
      name,
      this._canvasView.viewportSize
    )
    const dimension = this._canvasView.viewportSize
    this._tooltip.setText(`Captured. ${fileName}`)
    this._tooltip.show(2000)
    return { image: imageURL, type, name: fileName, length, dimension }
  }

  /**
   * Capture the current viewport and emit a 'capture' event.
   */
  async sendCapture() {
    const e = await this._capture('dataurl')
    this._eventBus.emit('capture', e)
  }
  async captureBy(type: 'dataurl'): Promise<CaptureEvent> {
    if (type === 'dataurl') {
      return await this._capture(type)
    } else {
      throw new Error('check capture type: ' + type)
    }
  }
  openImageSourceView() {
    if (this._viewHandle.isUsing('image-source-view')) {
      this._eventBus.emit('source', { type: 'added', sources: [] })
    } else {
      console.warn(`image-source-view is not used.`)
    }
  }
  static init(el: HTMLElement, param?: PhotoFlexInitParam): IPhotoFlexOp {
    const flex = new PhotoFlex(el, param)
    return flex.operator
  }
}
export * from './types'
export * from './rendering'
export {
  ImageLayer,
  ImageSource,
  IPhotoFlexOp,
  ScaleMode,
  Viewport,
  Point,
  type PhotoFlexContext,
}
export * from './event'
export * from './view'
