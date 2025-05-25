/**
 * types of view for photo flex.
 * * image-source-view: images you open in photo flex.
 */
export type ViewName = 'image-source-view' | 'after-image-view' | 'tooltip-view'
export interface IView {
  name: string
  bindTo(container: HTMLElement): void
}
export * from './action'

export type ViewParam = {
  name: ViewName
  use?: boolean
}
