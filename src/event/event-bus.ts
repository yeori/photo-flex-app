import EventEmitter from 'eventemitter3'
import {
  MoveEvent,
  Unsubscriber,
  ZoomEvent,
  ImageOpenEvent,
  PhotoFlexEvent,
  ViewportEvent,
  CaptureEvent,
} from '.'

export type PhotoFlexEventMap = {
  zoom: ZoomEvent
  move: MoveEvent
  open: ImageOpenEvent
  'viewport:resize': ViewportEvent
  capture: CaptureEvent
}

export class EventBus {
  private _bus: EventEmitter<PhotoFlexEvent>
  constructor() {
    this._bus = new EventEmitter<
      PhotoFlexEvent,
      (payload: PhotoFlexEventMap[PhotoFlexEvent]) => void
    >()
  }
  subscribe<K extends PhotoFlexEvent>(
    event: K,
    handler: (payload: PhotoFlexEventMap[K]) => void
  ): Unsubscriber {
    this._bus.on(event, handler)
    return () => {
      this._bus.off(event, handler)
    }
  }
  emit<K extends PhotoFlexEvent>(event: K, payload: PhotoFlexEventMap[K]) {
    setTimeout(() => {
      this._bus.emit(event, payload)
    }, 0)
  }
}
