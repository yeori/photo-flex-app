import { scaleByContain } from './scale-by-contain'
import { scaleByCover } from './scale-by-cover'

export type Point = {
  x: number
  y: number
}
export type Viewport = {
  width: number
  height: number
}
export type ScaleMode = 'contain' | 'cover' | 'custom'
export type Area = Point & Viewport
export type RatioResolver = (subject: Viewport, viewport: Viewport) => number
export const raitioResolvers: Record<
  Exclude<ScaleMode, 'custom'>,
  RatioResolver
> = {
  contain: scaleByContain,
  cover: scaleByCover,
}

export type ImageCacheParam = {
  imageUuid: string
  center: Point
  scale: number
}
