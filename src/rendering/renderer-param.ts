export type RendererName = 'canvas' | 'grid'

export type RendererParam = {
  name: RendererName
  order: number
}
/**
 *
 * For `{row: 2, col: 4}`
 * ```
 *  +--+--+--+
 *  |  |  |  |
 *  +--+--+--+
 *  |  |  |  |
 *  +--+--+--+
 * ```
 */
export type GridRenderParam = RendererParam & {
  row: number
  col: number
  color?: string
}
