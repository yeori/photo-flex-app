// app/src/view/action/action-open.ts
import { AbstractAction } from '.'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam } from '../../types'
import { dom } from '../../util'

/**
 * Action to open an image file for editing.
 */
export class OpenAction extends AbstractAction {
  private fileInput: HTMLInputElement | null = null

  constructor(_ctx: PhotoFlexContext, param: ActionParam) {
    super(_ctx, param)
  }
  get type() {
    return this.param.id
  }
  protected createElement(): HTMLButtonElement {
    const label = this.param.label
    const id = `photoflex-f-input-${this.type}`
    const capture = this.type === 'file' ? '' : 'environment'
    const btn = dom.createFromHtml<HTMLButtonElement>(
      `<button class="blue" data-photoflex-action aria-label="${label}"></button>`,
    )
    const fileInput = dom.createFromHtml<HTMLInputElement>(
      `<input type="file" id="${id}" accept="image/*" ${
        capture ? `capture="${capture}"` : ''
      } style="display: none;" title="${label}"></input>`,
    )
    fileInput.addEventListener('change', this.handleFileSelect)
    this.fileInput = fileInput

    this.context.subscribe('open', () => {
      fileInput.value = ''
    })

    return btn
  }
  override bindTo(parent: HTMLElement): void {
    super.bindTo(parent)
    if (this.fileInput) {
      parent.appendChild(this.fileInput)
    }
  }
  run(): void {
    this.fileInput?.click()
  }

  /**
   * Handles the 'change' event from the hidden file input.
   */
  private handleFileSelect = (event: Event): void => {
    event.stopPropagation()
    event.stopImmediatePropagation()
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files)
      // console.log(`Files selected: ${files.length} files selected`)

      const imageFiles = files.filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length > 0) {
        this.context.op
          .openImage(imageFiles)
          .then((images) => {
            const text = `Image ${images[0].name} opened`
            this.context.op.showTooltip(text)
          })
          .catch((error) => {
            console.error('Error opening image(s):', error)
          })
      } else {
        console.warn('No image files were selected.')
      }
    }
  }
  dispose(): void {
    if (this.fileInput) {
      this.fileInput.removeEventListener('change', this.handleFileSelect)
      this.fileInput.remove()
      this.fileInput = null
    }
  }
}
