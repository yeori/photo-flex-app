import { IAction } from '.'
import { ActionParam, IPhotoFlexOp } from '../..'
import { dom } from '../../util'

export class RulerAction implements IAction {
  private _hRuler: HTMLElement
  private _vRuler: HTMLElement
  private _param: ActionParam
  constructor(private readonly op: IPhotoFlexOp) {
    this._param = {
      id: 'action:ruler',
      label: 'ruler',
    }
    this._hRuler = dom.create('.h[data-photo-flex-ruler]')
    this._vRuler = dom.create('.v[data-photo-flex-ruler]')
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
    this.op.eventBus.subscribe('open', (paylod) => {
      const width = paylod.image.width
      const height = paylod.image.height
      dom.findOne(this._hRuler, '.label')!.innerText = `${width}`
      dom.findOne(this._vRuler, '.label')!.innerText = `${height}`
    })
  }
}
