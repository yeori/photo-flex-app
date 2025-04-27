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
  image: ImageSource
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
export type PhotoFlexEvent = 'zoom' | 'move' | 'open' | 'viewport:resize'
export type Unsubscriber = () => void
export { EventBus } from './event-bus'
