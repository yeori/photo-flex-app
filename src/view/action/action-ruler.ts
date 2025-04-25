import { IAction } from '../../types'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam } from '../../types'
import { dom } from '../../util'
import { Unsubscriber } from '../../event'

export class RulerAction implements IAction {
  private _hRuler: HTMLElement
  private _vRuler: HTMLElement
  private _param: ActionParam
  private _unsub: Unsubscriber | undefined
  constructor(private readonly _ctx: PhotoFlexContext) {
    this._param = {
      id: 'action:ruler',
      label: 'ruler',
    }
    const dataname = `[data-${_ctx.param.classnames!.prefix}-ruler]`
    this._hRuler = dom.create(`.h${dataname}`)
    this._vRuler = dom.create(`.v${dataname}`)
    dom.create<HTMLSpanElement>('span.label', this._hRuler).innerText = '200'
    dom.create<HTMLSpanElement>('span.label', this._vRuler).innerText = '200'
  }

  get id(): string {
    return this._param.id
  }
  get label(): string {
    return this._param.label
  }
  get element(): HTMLElement {
    //@ts-ignore
    return undefined
  }
  run(): void {}
  bindTo(container: HTMLElement) {
    dom.appends(container, this._hRuler, this._vRuler)
    this._unsub = this._ctx.op.eventBus.subscribe('open', (paylod) => {
      const width = paylod.image.width
      const height = paylod.image.height
      dom.findOne(this._hRuler, '.label')!.innerText = `${width}`
      dom.findOne(this._vRuler, '.label')!.innerText = `${height}`
    })
  }
  dispose(): void {
    this._unsub?.()
  }
}
