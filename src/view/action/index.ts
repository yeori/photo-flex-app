import { ActionParam } from '../..'
import { dom } from '../../util'

export interface IAction {
  bindTo(_el: HTMLElement): void
  id: string
  label: string
  element: HTMLElement
  run(): void
}
// export type ActionInitParam = {
//   id: string
//   label: string
// }
export abstract class AbstractAction implements IAction {
  protected _el: HTMLElement

  constructor(protected param: ActionParam) {
    this._el = this.createElement ? this.createElement() : dom.create('button')
    this._el.dataset.id = param.id
    this._el.innerText = param.label
  }
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
    parent.appendChild(this._el)
    this._el.addEventListener('click', () => {
      this.run()
    })
  }
  abstract run(): void
  get element(): HTMLElement {
    return this._el
  }
}
