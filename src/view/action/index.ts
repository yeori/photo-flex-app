import { dom } from '../../util'

export interface IAction {
  id: string
  label: string
  run(): void
}
export type ActionInitParam = {
  id: string
  label: string
}
export abstract class AbstractAction implements IAction {
  protected _el: HTMLButtonElement

  constructor(protected param: ActionInitParam) {
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
  abstract run(): void

  get element(): HTMLButtonElement {
    return this._el
  }
}
