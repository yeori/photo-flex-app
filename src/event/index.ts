import { ImageSource } from '../image-source'

export type ZoomEvent = { zoom: number; layer: string }
export type MoveEvent = {
  cx: number
  cy: number
  width: number
  height: number
}
export type ImageOpenEvent = {
  image: ImageSource
  ratio: number
}
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
 * ```
 */
export type PhotoFlexEvent = 'zoom' | 'move' | 'open' | 'viewport:resize'
export type Unsubscriber = () => void
export { EventBus } from './event-bus'
