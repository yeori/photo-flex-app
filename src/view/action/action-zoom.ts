import { IAction, ActionParam } from '../../types'
import { ImageOpenEvent, Unsubscriber } from '../../event'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class ZoomAction implements IAction {
  private _param: ActionParam
  private _el: HTMLDivElement
  private _unsub: Unsubscriber[] = []

  constructor(private readonly _ctx: PhotoFlexContext) {
    this._param = {
      id: 'zoom',
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
    const { op } = this._ctx
    const input = dom.create<HTMLInputElement>(
      'input[type=range][data-action-zoom][min=0.1][max=4][step=0.1][value=1]',
      this._el
    )
    input.addEventListener('change', (e: Event) => {
      const { value } = e.target as HTMLInputElement
      op.setZoom(Number(value))
    })
    container.appendChild(this._el)
    this._unsub.push(
      op.eventBus.subscribe('open', (paylod: ImageOpenEvent) => {
        input.value = `${paylod.ratio}`
      })
    )
    this._unsub.push(
      op.eventBus.subscribe('zoom', (paylod) => {
        input.value = `${paylod.zoom}`
      })
    )
  }
  updateZoom(zoomLevel: number) {
    this._ctx.op.setZoom(zoomLevel)
  }
  run(): void {
    this._ctx.op.setZoom(0.1)
  }
  dispose(): void {
    this._unsub.forEach((unsub) => {
      try {
        unsub()
      } catch (error) {
        console.error('Error during unsubscribing:', error)
      }
    })
    this._unsub = []
  }
}
