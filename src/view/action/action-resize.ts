import { AbstractAction } from '.'
import { DimensionSelector } from '../../component/dimension-selector'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class ResizeAction extends AbstractAction {
  constructor(
    _ctx: PhotoFlexContext,
    private options?: { width: number; height: number }[]
  ) {
    super({ id: 'resize', label: 'Resize' }, _ctx)
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
