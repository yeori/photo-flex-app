import { IAction } from '.'
import { ActionParam, IPhotoFlexOp } from '../..'
import { ImageOpenEvent, Unsubscriber } from '../../event'
import { dom } from '../../util'

export class ZoomAction implements IAction {
  private _param: ActionParam
  private _el: HTMLDivElement
  private _unsub: Unsubscriber | undefined

  constructor(private readonly op: IPhotoFlexOp) {
    this._param = {
      id: 'action:zoom',
      label: 'zoom',
    }
    this._el = dom.create<HTMLDivElement>('div')
    this._el.id = this.id
  }
  get id(): string {
    return this._param.id
  }
  get label(): string {
    return this._param.label
  }
  get element(): HTMLElement {
    return this._el
  }
  bindTo(container: HTMLElement): void {
    const input = dom.create<HTMLInputElement>(
      'input[type=range][data-action-zoom][min=0.1][max=4][step=0.1][value=1]',
      this._el
    )
    input.addEventListener('change', (e: Event) => {
      const { value } = e.target as HTMLInputElement
      this.op.setZoom(Number(value))
    })
    container.appendChild(this._el)
    this._unsub = this.op.eventBus.subscribe(
      'open',
      (paylod: ImageOpenEvent) => {
        input.value = `${paylod.ratio}`
      }
    )
  }
  updateZoom(zoomLevel: number) {
    this.op.setZoom(zoomLevel)
  }
  run(): void {
    this.op.setZoom(0.1)
  }
  dispose(): void {
    if (this._unsub) {
      this._unsub()
    }
  }
}
