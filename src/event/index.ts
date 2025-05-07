import { ImageSource } from '../image-source'

export type ZoomEvent = { ratio: number; layer: string }
/**
 * image move event
 */
export type MoveEvent = {
  cx: number
  cy: number
  width: number
  height: number
  layer: string
}
/**
 * image open event
 */
export type ImageOpenEvent = {
  image: ImageSource
  ratio: number
}
/**
 * viewport resize event
 */
export type ViewportEvent = {
  width: number
  height: number
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
   * An array of ImageSources, used for 'added' if multiple sources are added at once.
   */
  sources?: ImageSource[]
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
export type Unsubscriber = () => void
export { EventBus } from './event-bus'
