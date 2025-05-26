import { PhotoFlexEventMap, type EventBus } from './event/event-bus'
import { PhotoFlex, PhotoFlexEvent, Viewport } from './photo-flex'
import { Unsubscriber } from './event'

export interface IPhotoFlexOp {
  viewportSize: Viewport
  /**
   * The event bus used for communication between different components.
   */
  eventBus: EventBus
  /**
   * The current zoom level of the photo.
   */
  currentZoom: number
  /**
   * Resizes the viewport to the specified width and height.
   * @param width The new width of the viewport.
   * @param height The new height of the viewport.
   */
  resizeViewport(width: number, height: number): void
  /**
   * Updates the zoom level by the specified delta.
   * @param zoomDelta The amount to change the zoom level by.
   */
  updateZoomBy(zoomDelta: number): void
  /**
   * Sets the zoom level to the specified value.
   * @param zoomLevel The new zoom level.
   */
  setZoom(zoomLevel: number): void
  setOffset(imageUuid: string, x: number, y: number): void
  /**
   * Shows a modal element.
   * @param elem The HTML element to show as a modal.
   */
  showModal(elem: HTMLElement): void
  /**
   * Hides the modal.
   */
  hideeModal(): void
  /** Fits the photo to cover the entire viewport. */
  fitByCover(): void
  /** Fits the photo within the viewport without cropping. */
  fitByContain(): void
  /** Sets the zoom level to the photo's original size. */
  fitToRealSize(): void
  openImage(files: File[]): Promise<void>
  /**
   * Removes an image from the editor.
   * @param imageUuid The UUID of the image to remove.
   * @param activeImageUuid (optinonal) The UUID of the image to be activated.
   */
  removeImage(imageUuid: string, activeImageUuid?: string): boolean
  /**
   * text form for current zoom level
   * @param metric
   */
  getZoomText<K extends keyof ZoomValueMap>(metric: K): ZoomValueMap[K]
  /**
   * Captures the viewport and dispatches the `capture` event.
   * ```
   * flex.op.subscribe('capture', (payload) => {
   *   console.log('[capture]', payload)
   * })
   */
  sendCapture(): void
  /**
   * registers event listener
   */
  subscribe<K extends PhotoFlexEvent>(
    event: K,
    handler: (payload: PhotoFlexEventMap[K]) => void
  ): Unsubscriber
}

type ZoomValueMap = {
  percent: string
  decimal: number
}
export class PhotoFlexOp implements IPhotoFlexOp {
  constructor(
    private readonly target: PhotoFlex,
    private readonly _eventBus: EventBus
  ) {}
  get viewportSize() {
    const { width, height } = this.target
    return { width, height }
  }
  get currentZoom() {
    return this.target.getZoomLevel()
  }
  get eventBus() {
    return this._eventBus
  }
  resizeViewport(width: number, height: number): void {
    this.target.resizeViewport(width, height)
  }
  setZoom(zoomLevel: number): void {
    const { target } = this
    target.setZoom(zoomLevel)
    target.repaint()
  }
  setOffset(imageUuid: string, x: number, y: number): void {
    const { target } = this
    const layer = target.getLayerBy((layer) => layer.image.uuid === imageUuid)
    target.setLayerOffset(layer, x, y)
    target.repaint()
  }
  updateZoomBy(zoomDelta: number): void {
    const { target } = this
    target.updateZoomBy(zoomDelta)
    target.repaint()
  }
  showModal(elem: HTMLElement): void {
    this.target.modalUI.show(elem)
  }
  hideeModal(): void {
    this.target.modalUI.hide()
  }
  fitByCover(): void {
    this.target.fitBy('cover')
  }
  fitByContain(): void {
    this.target.fitBy('contain')
  }
  fitToRealSize(): void {
    this.target.fitToRealSize()
  }
  openImage(files: File[]): Promise<void> {
    return this.target.setImage(files)
  }
  removeImage(imageUuid: string, activeImageUuid?: string): boolean {
    return this.target.removeImageByUuid(imageUuid, activeImageUuid)
  }
  getZoomText<K extends keyof ZoomValueMap>(metric: K): ZoomValueMap[K] {
    const zoomLevle = this.target.getZoomLevel()
    if (metric === 'percent') {
      const value = zoomLevle * 100
      return `${Math.floor(value)}%` as ZoomValueMap[K]
    } else if (metric === 'decimal') {
      return zoomLevle as ZoomValueMap[K]
    } else {
      throw new Error(
        `check metric value [${metric}]. Use 'percent' or 'decimal'`
      )
    }
  }
  sendCapture(): void {
    this.target.sendCapture()
  }
  subscribe<K extends PhotoFlexEvent>(
    event: K,
    handler: (payload: PhotoFlexEventMap[K]) => void
  ): Unsubscriber {
    return this.eventBus.subscribe(event, handler)
  }
}
