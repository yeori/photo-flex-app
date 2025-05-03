import { AbstractAction } from '.'
import { DimensionSelector } from '../../component/dimension-selector'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class ResizeAction extends AbstractAction {
  constructor(
    private readonly _ctx: PhotoFlexContext,
    private options?: { width: number; height: number }[]
  ) {
    super({ id: 'resize', label: 'Resize' })
  }
  protected createElement(): HTMLElement {
    const btn =
      dom.createFromHtml<HTMLButtonElement>(`<button class="blue" data-photoflex-action aria-label="Resize viewport">
  <span class="material-symbols-outlined">aspect_ratio</span>
</button>`)
    // btn.disabled = true
    this._ctx.subscribe('open', () => {
      // btn.disabled = false
      this._ctx.op.hideeModal()
    })
    return btn
  }

  run(): void {
    this._ctx.op.showModal(new DimensionSelector(this._ctx, this.options))
  }
}
