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

export type ActionZoomParam = {
  id: 'zoom'
  label: string
  options: {
    min: number
    max: number
    step: number
    value: number
  }[]
}
export type ActionDefinition =
  | 'open'
  | 'resize'
  | ActionResizeParam
  | 'zoom'
  | ActionZoomParam
  | 'fit-cover'
  | 'fit-contain'
  | 'fit-real'
  | ActionParam
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
   * scale mode of open image.
   * ```
   * number - 0.5 for 50%
   * "contain" - adjusts the image to fully fit into the viewport.
   * "cover" - adjusts the image to fully cover the viewport
   * @default "contain"
   */
  scale?: number | 'contain' | 'cover'
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
