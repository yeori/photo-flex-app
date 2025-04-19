import { type EventBus } from './event/event-bus'
import { PhotoFlex } from './photo-flex'

export interface IPhotoFlexOp {
  resizeViewport(width: number, height: number): void
  updateZoomBy(zoomDelta: number): void
  eventBus: EventBus
  currentZoom: number
  hello(): void
  setZoom(zoomLevel: number): void
  showModal(elem: HTMLElement): void
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
  hello(): void {
    console.log('hello')
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
}
