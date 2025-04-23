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
    return dom.create('button')
  }

  bindTo(container: HTMLElement): void {
    super.bindTo(container)
    this._ctx.op.eventBus.subscribe('open', () => {
      this._ctx.op.hideeModal()
    })
  }

  run(): void {
    this._ctx.op.showModal(new DimensionSelector(this._ctx, this.options))
  }
}
