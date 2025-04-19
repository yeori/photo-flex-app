import { IRenderer } from '../'
import { PhotoFlexContext } from '../photo-flex-context'

/**
 * Grid renderer.
 */
export class GridRenderer implements IRenderer {
  /**
   * Constructor for GridRenderer.
   * @param _ctx - PhotoFlexContext
   */
  constructor(private readonly _ctx: PhotoFlexContext) {}

  /**
   * Draw horizontal and vertical line passing the center of viewport
   * @param ctx
   */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this._ctx.viewportSize
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
