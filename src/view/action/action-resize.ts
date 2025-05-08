import { AbstractAction } from '.'
import { DimensionSelector } from '../../component/dimension-selector'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionResizeParam } from '../../types'
import { dom } from '../../util'

export class ResizeAction extends AbstractAction {
  options: { width: number; height: number }[]
  constructor(_ctx: PhotoFlexContext, param: ActionResizeParam) {
    super(param, _ctx)
    this.options = param.options!
  }
  protected createElement<K extends HTMLElement>(): K {
    const btn =
      dom.createFromHtml<K>(`<button class="blue" data-photoflex-action aria-label="Resize viewport">
  <span class="material-symbols-outlined">aspect_ratio</span>
</button>`)
    this.context.subscribe('open', () => {
      this.context.op.hideeModal()
    })
    return btn
  }

  run(): void {
    this.context.op.showModal(new DimensionSelector(this.context, this.options))
  }
}
