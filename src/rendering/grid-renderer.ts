import { IRenderer } from '../rendering'
import { PhotoFlexContext } from '../photo-flex-context'
import { GridRenderParam } from './renderer-param'

/**
 * Grid renderer.
 */
export class GridRenderer implements IRenderer {
  /**
   * Constructor for GridRenderer.
   * @param _ctx - PhotoFlexContext
   */
  constructor(
    private readonly _ctx: PhotoFlexContext,
    private readonly param: GridRenderParam
  ) {}
  get name() {
    return 'grid'
  }
  get order() {
    return 65536
  }
  /**
   * Draw horizontal and vertical line passing the center of viewport
   * @param g2d
   */
  render(g2d: CanvasRenderingContext2D): void {
    const { width, height } = this._ctx.viewportSize
    const { row, col, color } = this.param
    g2d.save()
    const deltaW = width / col
    const deltaH = height / row
    g2d.beginPath()
    g2d.strokeStyle = color || '#ccc'
    g2d.lineWidth = 1
    for (let k = 1; k < row; k++) {
      g2d.moveTo(0, deltaH * k)
      g2d.lineTo(width, deltaH * k)
    }
    for (let k = 1; k < col; k++) {
      g2d.moveTo(deltaW * k, 0)
      g2d.lineTo(deltaW * k, height)
    }
    g2d.closePath()
    g2d.stroke()
    g2d.restore()
  }
}
