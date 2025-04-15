import { PhotoFlexContext } from '../../photo-flex-context' // Assuming PhotoFlexContext is exported from here
import { dom } from '../../util'

export class RulerView {
  private _hRuler: HTMLElement
  private _vRuler: HTMLElement
  constructor(private readonly _ctx: PhotoFlexContext) {
    // Changed parameter name and type
    this._hRuler = dom.create('.h[data-photo-flex-ruler]')
    this._vRuler = dom.create('.v[data-photo-flex-ruler]')
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
  bindTo(container: HTMLElement) {
    dom.appends(container, this._hRuler, this._vRuler)
    this._ctx.op.eventBus.subscribe('open', (paylod) => {
      const width = paylod.image.width
      const height = paylod.image.height
      const { width: vw, height: vh } = this._ctx.viewportSize
      dom.findOne(this._hRuler, '.label')!.innerText = `${vw}:${width}`
      dom.findOne(this._vRuler, '.label')!.innerText = `${vh}:${height}`
    })
  }
}
