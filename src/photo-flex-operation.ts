import { type EventBus } from './event/event-bus'
import { PhotoFlex } from './photo-flex'

export interface IPhotoFlexOp {
  updateZoomBy(zoomDelta: number): void
  eventBus: EventBus
  currentZoom: number
  hello(): void
  setZoom(zoomLevel: number): void
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
}
