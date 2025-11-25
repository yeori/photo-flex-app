import { type ViewParam, type PhotoFlexContext } from '.'
import { type RendererParam } from './rendering/renderer-param'

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
   * The tooltip text for the action.
   */
  tooltip?: string
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
  tooltip?: string
}

export type ActionResizeParam = {
  id: 'resize'
  label: string
  options: { width: number; height: number }[]
  tooltip?: string // Add optional tooltip property
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
  tooltip?: string // Add optional tooltip property
}
export type ActionConstructor = new (
  ctx: PhotoFlexContext,
  ...args: any[]
) => IAction

export type ActionNameList =
  | 'file'
  | 'camera'
  | 'capture'
  | 'resize'
  | 'fit-cover'
  | 'fit-contain'
  | 'fit-real'
  | 'zoom'
export type ActionDefinition =
  | ActionNameList
  | ActionResizeParam
  | ActionZoomParam
  | ActionParam
  | ActionConstructor
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
export type PhotoFlexHandlerParam = {
  /**
   * called when a new image is downloaded or captured
   * ```
   * ex) "your-img.png" => {name: "your-img", ext: ".png"}
   * ```
   * @returns a new filename
   */
  name?: (
    image: ImageMetaData,
    /**
     * donwloaded(captured) image size in pixel
     */
    dim: { width: number; height: number }
  ) => string
  /**
   * called when an action instance is created.
   */
  action?: (actionId: string, el: HTMLElement) => void
}
/**
 * initial configuration paramters
 */
export type PhotoFlexInitParam = {
  /**
   * width of image editor canvas
   * ```
   * "fluid" means "100%". fill the width of the container.
   * ```
   * @default "400px"
   */
  width?: 'fluid' | string
  /**
   * height of image editor canvas
   * @default "400px"
   */
  height?: 'fluid' | string
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
  /**
   * used for rendering on canvas
   */
  renderers?: RendererParam[]
  views?: ViewParam[]
  handler?: PhotoFlexHandlerParam
  loadContext?: (canvas: HTMLCanvasElement) => CanvasRenderingContext2D
}
export type BlobData = {
  name?: string
  data: Blob
}
export type ImageMetaData = {
  /**
   * file name of the image
   */
  name: string
  /**
   * unique id
   */
  uuid: string
  /**
   * return [prefix, extension], for file name.
   */
  parseName(): [string, string]
  /**
   * mime type
   */
  type: string
}
