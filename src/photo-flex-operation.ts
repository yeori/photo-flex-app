import { type EventBus } from './event/event-bus'
import { type ImageLayer, PhotoFlex } from './photo-flex'

export interface IPhotoFlexOp {
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
  openImage(file: File): Promise<void>
  /**
   * text form for current zoom level
   * @param metric
   */
  getZoomText<K extends keyof ZoomValueMap>(metric: K): ZoomValueMap[K]
  getLayer(layerUuid: string): ImageLayer
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
  openImage(file: File): Promise<void> {
    return this.target.setImage(file)
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
  getLayer(layerUuid: string): ImageLayer {
    return this.target.getLayer(layerUuid)
  }
}
