import { AbstractAction } from '.'
import { DimensionSelector } from '../../component/dimension-selector'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionResizeParam } from '../../types'
import { dom } from '../../util'
/**
 * show resize view
 */
export class ResizeAction extends AbstractAction {
  options: { width: number; height: number }[]
  constructor(_ctx: PhotoFlexContext, param: ActionResizeParam) {
    super(_ctx, param)
    this.options = param.options!
  }
  protected createElement(): HTMLButtonElement {
    const btn = dom.createFromHtml<HTMLButtonElement>(
      `<button class="blue" data-photoflex-action aria-label="Resize viewport"></button>`
    )
    this.context.subscribe('open', () => {
      this.context.op.hideeModal()
    })
    return btn
  }

  run(): void {
    this.context.op.showModal(new DimensionSelector(this.context, this.options))
  }
}
