import { IRenderer, PhotoFlexInitParam } from '../'

/**
 * Grid renderer.
 */
export class GridRenderer implements IRenderer {
  private _width: number
  private _height: number

  /**
   * Constructor for GridRenderer.
   * @param param
   */
  constructor(private readonly _param: PhotoFlexInitParam) {
    const [w] = _parseUnit(_param.width!)
    const [h] = _parseUnit(_param.height!)
    this._width = w
    this._height = h
  }

  /**
   * Draw horizontal and vertical line passing the center of viewport
   * @param ctx
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.beginPath()
    const cw = this._width / 2
    const ch = this._height / 2
    ctx.moveTo(0, ch)
    ctx.lineTo(this._width, ch)
    ctx.moveTo(cw, 0)
    ctx.lineTo(cw, this._height)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }
}

function _parseUnit(exp: string): [number, string] {
  const result = /([0-9.]+)(.*)/.exec(exp)
  if (result) {
    const [, num, unit] = result
    return [parseFloat(num), unit]
  }
  return [0, '']
}