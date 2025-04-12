import { Viewport } from '../scale'

export interface IRenderer {
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void
}
