import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam, IAction } from '../../types'
import { dom } from '../../util'

export abstract class AbstractAction implements IAction {
  protected _el: HTMLElement | undefined
  protected _ctx?: PhotoFlexContext
  protected param: ActionParam

  constructor(ctx: PhotoFlexContext, param: ActionParam)
  constructor(param: ActionParam)
  constructor(ctxOrParam: PhotoFlexContext | ActionParam, param?: ActionParam) {
    if (ctxOrParam && typeof ctxOrParam === 'object' && 'op' in ctxOrParam && 'paramContext' in ctxOrParam) {
      this._ctx = ctxOrParam as PhotoFlexContext
      this.param = param!
    } else {
      this.param = ctxOrParam as ActionParam
    }
  }
  setContext(ctx: PhotoFlexContext) {
    this._ctx = ctx
  }
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
    if (!this._ctx) {
      throw new Error(`[PhotoFlex] Action "${this.id}" context is not bound yet.`)
    }
    return this._ctx
  }
  bindTo(parent: HTMLElement): void {
    const el = this.createElement
      ? this.createElement()
      : dom.create<HTMLButtonElement>('button')
    el.dataset.action = this.id
    if (!el.ariaLabel) {
      el.ariaLabel = this.label
    }
    const initialIcon = (this.param.icon && typeof this.param.icon === 'object' && typeof this.param.icon !== 'function')
      ? (this.param.icon as any).contain
      : this.param.icon
    this.context.decorateAction(this.id, el, initialIcon)
    this.context.paramContext.bindTooltip(el, this.param)
    el.addEventListener('click', () => {
      this.run()
    })
    this._el = el
    this.context.subscribe('open', () => {
      el.disabled = false
    })
    parent.appendChild(this._el)
  }
  run(): void {}
  get element(): HTMLElement {
    return this._el!
  }
}
