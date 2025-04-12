import { IRenderer } from '.'
import { Viewport } from '../scale'

export class GridRenderer implements IRenderer {
  /**
   * draw horizontal and vertical line passing the center of viewport
   * @param ctx
   * @param viewport
   */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const { width, height } = viewport
    ctx.save()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.beginPath()
    const cw = width / 2
    const ch = height / 2
    ctx.moveTo(0, ch)
    ctx.lineTo(width, ch)
    ctx.moveTo(cw, 0)
    ctx.lineTo(cw, height)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}
