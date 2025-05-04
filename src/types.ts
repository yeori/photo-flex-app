/**
 * an action that can be performed within the application.
 */
export interface IAction {
  /**
   * Binds ui element(s) to a specific container.
   * @param container - The HTML container element to bind to.
   */
  bindTo(container: HTMLElement): void
  /**
   * The unique identifier of the action.
   */
  id: string
  /**
   * The label or display name of the action.
   */
  label: string
  /**
   * The HTML element associated with the action.
   */
  readonly element: HTMLElement
  /**
   * Executes the action.
   */
  run(): void
  /**
   * Optional method to dispose of any resources held by the action.
   */
  dispose?(): void
}
/**
 * css selector syntax to
 */
export type CssSelector = string
export type ActionParam = {
  id: string
  label: string
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
  | 'file'
  | 'camera'
  | 'capture'
  | 'resize'
  | 'fit-cover'
  | 'fit-contain'
  | 'fit-real'
  | ActionResizeParam
  | 'zoom'
  | ActionZoomParam
  | ActionParam
  | IAction
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
export type PhotoFlexHandlerParam = {
  /**
   * called when a new image is downloaded or captured
   * ```
   * ex) "your-img.png" => {name: "your-img", ext: ".png"}
   * ```
   * @returns a new filename
   */
  name?: (
    /**
     * `youer-img` in "your-img.png"
     */
    name: string,
    /**
     * `.png` in "your-img.png"
     */
    ext: string,
    /**
     * donwloaded(captured) image size in pixel
     */
    dim: { width: number; height: number }
  ) => string
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
  handler?: PhotoFlexHandlerParam
  loadContext?: (canvas: HTMLCanvasElement) => CanvasRenderingContext2D
}
