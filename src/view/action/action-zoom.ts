import { IAction, ActionParam } from '../../types'
import { ImageOpenEvent, Unsubscriber } from '../../event'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class ZoomAction implements IAction {
  private _el: HTMLDivElement
  private _unsub: Unsubscriber[] = []
  private _disabled: boolean = true

  constructor(
    private readonly _ctx: PhotoFlexContext,
    private readonly _param: ActionParam
  ) {
    this._el = dom.create<HTMLDivElement>('div.blue[data-photoflex-action]')
    this._el.id = this.id
    dom.style(this._el, {
      position: 'relative',
      display: 'flex',
      padding: '0',
      alignItems: 'stretch',
    })
  }
  get id(): string {
    return this._param.id
  }
  get label(): string {
    return this._param.label
  }
  get element(): HTMLElement {
    return this._el!
  }
  private renderZoom(zoomLevel: number) {
    const input = dom.findOne<HTMLInputElement>(this._el, 'input[type=range]')
    const scaleLabel = dom.findOne(this._el, 'span.scale')
    input.disabled = this._disabled
    input.value = `${zoomLevel}`
    if (!this._disabled) {
      scaleLabel.innerHTML = `${this._ctx.op.getZoomText('percent')}`
    }
  }
  bindTo(container: HTMLElement): void {
    const { op, paramContext } = this._ctx
    const { min, max, step, value } = paramContext.getOptionForZoomAction()
    const input = dom.create<HTMLInputElement>(
      `input.blue[type=range][data-action="zoom"][min=${min}][max=${max}][step=${step}][value=${value}]`,
      this._el
    )
    input.ariaLabel = 'Scale image'
    input.addEventListener('input', (e: Event) => {
      const { value } = e.target as HTMLInputElement
      op.setZoom(Number(value))
    })
    const label = dom.create<HTMLSpanElement>('span.scale', this._el)
    dom.style(label, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      color: 'white',
    })
    this.renderZoom(1)
    container.appendChild(this._el)
    this._unsub.push(
      op.subscribe('open', (paylod: ImageOpenEvent) => {
        this._disabled = false
        this.renderZoom(paylod.ratio)
      }),
      op.subscribe('zoom', (paylod) => this.renderZoom(paylod.ratio))
    )
  }
  updateZoom(zoomLevel: number) {
    this._ctx.op.setZoom(zoomLevel)
  }
  run(): void {}
  dispose(): void {
    this._unsub.forEach((unsub) => {
      try {
        unsub()
      } catch (error) {
        console.error('Error during unsubscribing:', error)
      }
    })
    this._unsub = []
    this._el?.remove()
  }
}
