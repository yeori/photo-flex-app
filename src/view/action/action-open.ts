// app/src/view/action/action-open.ts
import { AbstractAction } from '.'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'

/**
 * Action to open an image file for editing.
 */
export class OpenAction extends AbstractAction {
  private fileInput: HTMLInputElement | null = null

  constructor(
    _ctx: PhotoFlexContext,
    private readonly type: 'file' | 'camera'
  ) {
    // Define action ID and default label
    super({ id: type, label: 'Open' }, _ctx)
  }

  /**
   * Creates the button element for the action.
   */
  protected createElement<K extends HTMLElement>(): K {
    const label = this.type === 'file' ? 'Open Image' : 'Take Photo'
    const id = `photoflex-f-input-${this.type}`
    const icon = this.type === 'file' ? 'folder_open' : 'photo_camera'
    const capture = this.type === 'file' ? '' : 'environment'
    const labelEl =
      dom.createFromHtml<K>(`<label  class="blue" tabindex=0 data-photoflex-action for="${id}" aria-label="${label}">
  <input type="file" id="${id}" accept="image/*" ${
        capture && `capture="${capture}"`
      } data-photoflex-action title="${label}"></input>
  <span class="material-symbols-outlined">${icon}</span>
</label>
    `)
    labelEl.role = 'button'
    labelEl.ariaPressed = 'false'
    const fileInput = dom.findOne<HTMLInputElement>(labelEl, 'input')
    fileInput.accept = 'image/*'
    fileInput.hidden = true
    fileInput.style.display = 'none'
    fileInput.addEventListener('change', (e) => {
      console.log('File input changed', e.target)
      this.handleFileSelect(e)
    })
    labelEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        labelEl.ariaPressed = 'true'
        fileInput.click()
      }
    })
    labelEl.addEventListener('blur', () => {
      labelEl.ariaPressed = 'false'
    })
    this.fileInput = fileInput

    this.context.subscribe('open', () => {
      fileInput.value = ''
    })

    return labelEl
  }
  run(): void {}

  /**
   * Handles the 'change' event from the hidden file input.
   */
  private handleFileSelect(event: Event): void {
    event.stopPropagation()
    event.stopImmediatePropagation()
    const input = event.target as HTMLInputElement
    // Check if files were selected
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      console.log(`Files selected: ${files.length} files selected`);

      // Ensure the selected file is an image based on MIME type
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        // Use the context's operator to open the image
        this.context.op
          .openImage(imageFiles)
          .then(() => {
            console.log('Image(s) opened successfully via operator.')
          })
          .catch((error) => {
            console.error('Error opening image(s):', error)
            // TODO: Provide user feedback about the error (e.g., via modal or notification)
          })
      } else {
        console.warn('No image files were selected.');
        // TODO: Provide user feedback about the invalid file type
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
