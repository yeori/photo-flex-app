export interface IAction {
  bindTo(container: HTMLElement): void
  id: string
  label: string
  element: HTMLElement
  run(): void
  dispose?(): void
}
/**
 * css selector syntax to
 */
export type CssSelector = string
export type ActionParam = {
  id: string
  label: string
  selector?: CssSelector
}

export type ActionResizeParam = {
  id: 'resize'
  label: string
  options: { width: number; height: number }[]
}

export type ActionDefinition = string | ActionParam | ActionResizeParam
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
export type PhotoflexSizeParam = {
  value: 'flud' | string
  resizable?: boolean
}
/**
 * initial configuration paramters
 */
export type PhotoFlexInitParam = {
  /**
   * width of image editor canvas
   * ```
   * "fluid" - means "100%". fill the width of the container.
   * ```
   * @default "400px"
   */
  width?: 'fluid' | string | PhotoflexSizeParam
  /**
   * height of image editor canvas
   * @default "400px"
   */
  height?: string | PhotoflexSizeParam
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
