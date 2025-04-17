import { IAction } from '.'

export class ResizeAction implements IAction {
  id: string
  label: string
  element: HTMLElement

  constructor(id: string, label: string) {
    this.id = id
    this.label = label
    this.element = document.createElement('div')
  }

  bindTo(el: HTMLElement): void {
    this.element = el
  }

  run(): void {
    if (!this.element) {
      throw new Error('element not initialized')
    }
  }
}
