import { IView } from '..'
import { type ImageSource } from '../../image-source'
import { PhotoFlexContext } from '../../photo-flex-context' // Assuming PhotoFlexContext is exported from here
import { dom } from '../../util'

export class RulerView implements IView {
  private _hRuler: HTMLElement
  private _vRuler: HTMLElement
  constructor(private readonly _ctx: PhotoFlexContext) {
    const dataname = `[data-${_ctx.param.classnames!.prefix}-ruler]`
    this._hRuler = dom.create(`.h${dataname}`)
    this._vRuler = dom.create(`.v${dataname}`)
    const { width, height } = this._ctx.viewportSize
    dom.create<HTMLSpanElement>(
      'span.label',
      this._hRuler
    ).innerText = `${width}`
    dom.create<HTMLSpanElement>(
      'span.label',
      this._vRuler
    ).innerText = `${height}`
  }
  private _draw(image: ImageSource) {
    const { width, height } = image
    const { width: vw, height: vh } = this._ctx.viewportSize
    dom.findOne(this._hRuler, '.label')!.innerText = `${vw}:${width}`
    dom.findOne(this._vRuler, '.label')!.innerText = `${vh}:${height}`
  }
  bindTo(container: HTMLElement) {
    dom.appends(container, this._hRuler, this._vRuler)
    const { eventBus } = this._ctx
    eventBus.subscribe('open', (paylod) => {
      this._draw(paylod.image)
    })
    eventBus.subscribe('viewport:resize', ({ image }) => {
      if (image) {
        this._draw(image)
      }
    })
  }
}
