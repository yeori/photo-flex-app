import { AbstractAction } from '.'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class OpenImageSourceAction extends AbstractAction {
  private _template = `<button data-photoflex-action data-photoflex-imagesource class="white shadow"><span class="material-symbols-outlined">more_horiz</span></button>`
  constructor(_ctx: PhotoFlexContext) {
    super(_ctx, { id: 'open-image-source', label: 'Open Image Source' })
  }
  protected createElement(): HTMLButtonElement {
    return dom.createFromHtml<HTMLButtonElement>(this._template)
  }
  run(): void {
    this._ctx!.openImageSourceView()
  }
}
