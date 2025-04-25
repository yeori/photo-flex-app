import { ActionParam, IAction } from '../../types'
import { dom } from '../../util'
export abstract class AbstractAction implements IAction {
  protected _el: HTMLElement | undefined

  constructor(protected param: ActionParam) {}
  protected createElement?(): HTMLElement {
    return dom.create('button')
  }
  get id(): string {
    return this.param.id
  }
  get label(): string {
    return this.param.label
  }
  bindTo(parent: HTMLElement): void {
    this._el = this.createElement ? this.createElement() : dom.create('button')
    this._el.dataset.action = this.id
    parent.appendChild(this._el)
    this._el.addEventListener('click', () => {
      this.run()
    })
  }
  abstract run(): void
  get element(): HTMLElement {
    return this._el!
  }
}
