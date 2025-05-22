import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam, IAction } from '../../types'
import { dom } from '../../util'

export abstract class AbstractAction implements IAction {
  protected _el: HTMLElement | undefined

  constructor(protected _ctx: PhotoFlexContext, protected param: ActionParam) {}
  protected createElement?(): HTMLButtonElement {
    return dom.create<HTMLButtonElement>('button')
  }
  get id(): string {
    return this.param.id
  }
  get label(): string {
    return this.param.label
  }
  protected get context(): PhotoFlexContext {
    return this._ctx!
  }
  bindTo(parent: HTMLElement): void {
    const el = this.createElement
      ? this.createElement()
      : dom.create<HTMLButtonElement>('button')
    el.dataset.action = this.id
    if (!el.ariaLabel) {
      el.ariaLabel = this.label
    }
    this._ctx!.paramContext.bindTooltip(el, this.param)
    el.addEventListener('click', () => {
      this.run()
    })
    this._el = el
    this.context.subscribe('open', () => {
      el.disabled = false
    })
    parent.appendChild(this._el)
  }
  abstract run(): void
  get element(): HTMLElement {
    return this._el!
  }
}
