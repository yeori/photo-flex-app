import { type EventBus } from './event/event-bus'
import { PhotoFlex } from './photo-flex'

export interface IPhotoFlexOp {
  eventBus: EventBus
  currentZoom: number
  hello(): unknown
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
}
