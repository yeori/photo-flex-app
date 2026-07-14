import { type ImageSource } from '../image-source'

export type ImageRect = {
  cx: number
  cy: number
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}
/**
 * image move event
 */
export type MoveEvent = {
  ratio: number
  /**
   * offset(cx, cy) from viewport center(0, 0).
   * Represents how far the center of the image is from the center of the viewport.
   */
  offset: { cx: number; cy: number }
  /**
   * Indicates the area of the image to be captured.
   */
  rect: ImageRect
  /**
   * image
   */
  image: ImageSource
}
export type ZoomEvent = MoveEvent
/**
 * image open event
 */
export type ImageOpenEvent = {
  ratio: number
  image: ImageSource
}
/**
 * viewport resize event
 */
export type ViewportEvent = {
  /**
   * viewport(canvas) width in pixel
   */
  width: number
  /**
   * viewport(canvas) height in pixel
   */
  height: number
  /**
   * image
   */
  image?: ImageSource
}
/**
 * a captured image
 */
export type CaptureEvent = {
  /**
   * DataURL form if type is "dataurl"
   */
  image: string
  type: 'dataurl'
  /**
   * original file name
   */
  name: string
  /**
   * file length in bytes
   */
  length: number
  dimension: { width: number; height: number }
}
/**
 * the types of events that can be emitted by the SourceManager.
 */
export type SourceEventType =
  | 'added'
  | 'activated'
  | 'deactivated'
  | 'deleted'
  | 'error'

/**
 * Represents an event related to the SourceManager.
 */
export type SourceEvent = {
  /**
   * The specific type of source event.
   */
  type: SourceEventType
  /**
   * An array of ImageSources, used for 'added' and 'deleted' if multiple sources are added(deleted) at once.
   */
  images?: ImageSource[]
  /**
   * The error object, only present if type is 'error'.
   */
  error?: any
  /**
   * Provided when the type is `added`.
   */
  files?: File[]
}
/**
 * PhotoFlex event list
 * ```
 * zoom - zool level changed
 * move - image moved
 * open - a new image opened
 * viewport:resize - viewport(canvas) is resized
 * ```
 */
export type PhotoFlexEvent =
  | 'zoom'
  | 'move'
  | 'open'
  | 'viewport:resize'
  | 'capture'
  | 'source'
  | 'action:resize'
export type Unsubscriber = () => void
export { EventBus } from './event-bus'
