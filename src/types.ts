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
/**
 * Used to create an icon for an action (e.g., buttons). It is embedded into `button[data-photoflex-action]`
 *
 * @param actionId - The unique identifier of the action to which this icon is applied (e.g., `'zoom'`, `'resize'`, `'capture'`).
 * @param className - The predefined CSS class name for the icon element.
 * @returns The `HTMLElement` to render, or a `string` containing HTML/SVG markup.
 *
 * #### 1. SVG
 * ```typescript
 * const svgIconRenderer: ActionIconRender = (actionId, className) => {
 *   if (actionId === 'zoom') {
 *     return `<svg class="${className}" viewBox="0 0 24 24">
 *       <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5..."/>
 *     </svg>`;
 *   }
 *   return `<i class="${className} default-icon"></i>`;
 * };
 * ```
 *
 * #### 2. Creating and returning an HTMLElement object
 * ```typescript
 * const elementIconRenderer: ActionIconRender = (actionId, className) => {
 *   const iconEl = document.createElement('span');
 *   iconEl.className = `${className} material-icons`;
 *   iconEl.textContent = actionId === 'zoom' ? 'zoom_in' : 'help';
 *   return iconEl;
 * };
 * ```
 */
export type ActionIconRender = (
  actionId: string,
  className: string,
) => HTMLElement | string

export type ActionParam = {
  id: string
  label: string
  tooltip?: string | Record<string, string>
  icon?: string | ActionIconRender | Record<string, string | ActionIconRender>
}

export type ActionResizeParam = {
  id: 'resize'
  label: string
  options: { width: number; height: number }[]
  tooltip?: string // Add optional tooltip property
  useDefaultUI?: boolean
  icon?: string | ActionIconRender
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
  icon?: string | ActionIconRender
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
  | 'fit-action'
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
   * @returns filename to be assigned to the captured image
   */
  name?: (
    image: ImageMetaData,
    /**
     * donwloaded(captured) image size in pixel
     */
    dim: { width: number; height: number },
  ) => string
  /**
   * called when an action instance is created.
   */
  action?: (
    actionId: string,
    el: HTMLElement,
    customIcon?: string | ActionIconRender,
  ) => void
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
export type FittingParam = {
  scale?: number
  offset?: { cx: number; cy: number }
}
