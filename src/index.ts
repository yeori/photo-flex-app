/**
 * css selector syntax to
 */
export type CssSelector = string
export type ActionParam = {
  id: string
  label: string
  selector?: CssSelector
}
export type ActionDefinition = string | ActionParam
/**
 * datanames for ui elements.
 *
 * ```
 * prefix: 'photoflex'
 * toolbar: `${prefix}-toolbar`,
 * canvas: '${prefix}-canvas',
 * ```
 */
export type DataNameParam = {
  prefix?: string
  root?: string
  board?: string
  toolbar?: string
  canvas?: string
}
/**
 * initial configuration paramters
 */
export type PhotoFlexInitParam = {
  /**
   * width of image editor canvas
   * @default "400px"
   */
  width?: string
  /**
   * height of image editor canvas
   * @default "400px"
   */
  height?: string
  /**
   * zoom mode of image.
   * e.g. 0.5(means 50%), "contain"(zoom to fit the viewport), "cover" means(zoom to cover the viewport)
   * @default "contain"
   */
  zoom?: number | 'contain' | 'cover'
  /**
   * sensitivity when zooming by mouse wheel
   * @default 0.002
   */
  wheelSensitivity?: number
  /**
   * classnames for ui elements. setting null does not aassign the default classnames
   */
  classnames?: null | DataNameParam
  /**
   * actions to be installed
   */
  actions?: ActionDefinition[]
  loadContext?: (canvas: HTMLCanvasElement) => CanvasRenderingContext2D
}
export * from './photo-flex'
export * from './rendering'
export * from './event'
export { type IPhotoFlexOp } from './photo-flex-operation'
export type { IRenderer } from './rendering'
