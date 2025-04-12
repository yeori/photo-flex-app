// import { Viewport } from '../viewport'
import { scaleByContain } from './scale-by-contain'
import { scaleByCover } from './scale-by-cover'
import { scaleByCustom } from './scale-by-custom'

export type Viewport = {
  width: number
  height: number
}
export type ScaleMode = 'contain' | 'cover' | 'custom'
export type Area = { x: number; y: number; width: number; height: number }
export type RenderingSpec = {
  subject: Area
  view: Area
  ratio: number
}
export type Scaler = (src: Viewport, view: Viewport) => RenderingSpec
export const scalers: Record<ScaleMode, Scaler> = {
  contain: scaleByContain,
  cover: scaleByCover,
  custom: scaleByCustom,
}
