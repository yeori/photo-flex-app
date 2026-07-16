import { type ActionIconRender } from '../types'

export type ViewName =
  | 'image-source-view'
  | 'after-image-view'
  | 'tooltip-view'
  | 'capture-effect-view'
export interface IView {
  name: string
  bindTo(container: HTMLElement): void
}
export * from './action'
export * from './capture-effect-view'

export type CaptureEffectViewParam = {
  icon?: string | ActionIconRender
  label?: string
}

export type ViewParam =
  | {
      name: 'capture-effect-view'
      use?: boolean
      payload?: CaptureEffectViewParam
    }
  | {
      name: Exclude<ViewName, 'capture-effect-view'>
      use?: boolean
    }

