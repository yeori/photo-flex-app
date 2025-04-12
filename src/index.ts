/**
 * css selector syntax to
 */
export type CssSelector = string
/**
 * initial configuration paraters
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
   * e.g. "100%" means 1:1 zoom, "contain" means zoom to fit the editor, "cover" means zoom to cover the editor
   * @default "contain"
   */
  zoom?: number | 'contain' | 'cover'

  loadContext?: (canvas: HTMLCanvasElement) => CanvasRenderingContext2D
}
export * from './photo-flex'
export * from './rendering'
