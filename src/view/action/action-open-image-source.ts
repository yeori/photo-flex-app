import { AbstractAction } from '.'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

export class OpenImageSourceAction extends AbstractAction {
  private _template = `<button data-photoflex-action data-photoflex-imagesource class="white shadow"><span class="material-symbols-outlined">more_horiz</span></button>`
  constructor(_ctx: PhotoFlexContext) {
    super({ id: 'open-image-source', label: 'Open Image Source' }, _ctx)
  }
  protected createElement<K extends HTMLElement = HTMLButtonElement>(): K {
    const el = dom.createFromHtml(this._template)
    return el as unknown as K
  }
  run(): void {
    this._ctx!.openImageSourceView()
  }
}
