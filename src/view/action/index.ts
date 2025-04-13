import { ActionParam } from '../..'
import { dom } from '../../util'

export interface IAction {
  bindTo(_el: HTMLElement): unknown
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
  protected _el: HTMLButtonElement

  constructor(protected param: ActionParam) {
    this._el = dom.create('button')
    this._el.dataset.id = param.id
    this._el.innerText = param.label
    this._el.addEventListener('click', () => {
      this.run()
    })
  }
  get id(): string {
    return this.param.id
  }
  get label(): string {
    return this.param.label
  }
  bindTo(parent: HTMLElement): void {
    parent.appendChild(this._el)
  }
  abstract run(): void
  get element(): HTMLButtonElement {
    return this._el
  }
}
