export * from './grid-renderer'
export * from './renderer-param'
export interface IRenderer {
  name: string
  order: number
  render(ctx: CanvasRenderingContext2D): void
}
