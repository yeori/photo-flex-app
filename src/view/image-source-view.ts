/**
 * list of image sources
 */
import { type IView } from '.'
import { SourceEvent } from '../event'
import { type ImageSource } from '../image-source'
import { type PhotoFlexContext } from '../photo-flex-context'
import { dom } from '../util'

/**
 * Renders a list of available ImageSource objects.
 */
export class ImageSourceView implements IView {
  private _container: HTMLDivElement
  private _sources: ImageSource[] = []
  private _activeSource: ImageSource | undefined
  private templates = {
    menu: `<menu data-photoflex-image-sources><li>close</li><div class="inner"></div></menu>`,
    item: `<li tabindex="0" role="button" data-photoflex-image-item></li>`,
    close: `<button data-photoflex-action><span class="material-symbols-outlined">close</span></button>`,
  }
  constructor(private readonly _ctx: PhotoFlexContext) {
    this._container = dom.createFromHtml<HTMLDivElement>(this.templates.menu)
  }

  /**
   * Attaches this view to a container element.
   * Subscribes to the 'source' event to update the image list.
   * @param container The HTML element to attach to.
   */
  bindTo(container: HTMLElement): void {
    container.appendChild(this._container)

    this._ctx.subscribe('source', (event) => {
      console.log('ImageSourceView: Received source event', event)
      this.update(event) // Call update when a new image is added
    })
  }

  /**
   * Updates the view based on source events (add, remove, clear).
   * @param event The SourceEvent object.
   */
  private update(event: SourceEvent): void {
    //Refactor: use correct type SourceEvent
    switch (event.type) {
      case 'added':
        if (event.sources) {
          this._sources.push(...event.sources)
        }
        this.render()
        break
      case 'deleted':
        if (event.sources) {
          const uuids = new Set<string>(event.sources.map((e) => e.uuid))
          this._sources = this._sources.filter((s) => !uuids.has(s.uuid))
          this.render()
        }
        break
      case 'activated':
        const { sources } = event
        if (sources) {
          this._activeSource = sources[0]
          this._setActive()
        }
        break
      case 'deactivated':
        // this._activeSource = null;
        // this.render();
        break
      case 'error': // optional, can display error messages
        console.warn('ImageSourceView: Error loading source', event.error)
        break

      default:
        console.warn('ImageSourceView: Unknown source event type:', event.type)
        break
    }
  }

  private _setActive() {
    const items = dom.finds<HTMLLIElement>(
      this._container,
      '[data-photoflex-image-item]'
    )
    items.forEach((li) => {
      li.classList.remove('active')
      dom.findOne(li, 'button')?.remove()
    })
    const found = items.find(
      (li) => li.dataset.uuid === this._activeSource?.uuid
    )
    if (found) {
      found.classList.add('active')
      dom.appends(
        found,
        dom.createFromHtml<HTMLButtonElement>(this.templates.close)
      )
    }
  }
  /**
   * Renders the list of ImageSource objects.
   * Creates a simple list of image names (you can customize this to show thumbnails, etc.).
   */
  private render(): void {
    const body = this._container.querySelector('.inner')!

    dom.emptify(body)

    if (this._sources.length === 0) {
      this._container.textContent = 'No images loaded.'
      return
    }
    const size = 42

    this._sources.forEach((source) => {
      const itemDiv = dom.createFromHtml<HTMLDivElement>(this.templates.item) // Class for styling
      dom.style(itemDiv, {
        gridTemplateRows: `${size - 14}px 14px`,
        gridTemplateColumns: `${size}px 1fr min-content`,
      })
      itemDiv.dataset.uuid = source.uuid
      itemDiv.title = source.name // Add tooltip

      const image = dom.create<HTMLCanvasElement>('canvas')
      dom.style(image, {
        width: `${size}px`,
        height: `${size}px`,
      })

      const ctx = image.getContext('2d')

      if (ctx && source.bitmap) {
        image.width = size
        image.height = size
        // Scale down to fit in the 40px height/width
        const scale = Math.min(size / source.width, size / source.height) // Ensure scale is positive
        const scaledWidth = source.width * scale
        const scaledHeight = source.height * scale

        const offsetX = (size - scaledWidth) / 2
        const offsetY = (size - scaledHeight) / 2
        //Draw the image
        ctx.drawImage(
          source.bitmap,
          offsetX,
          offsetY,
          scaledWidth,
          scaledHeight
        )
      }

      const nameRow = dom.createFromHtml<HTMLDivElement>(
        '<span class="name"></span>'
      )
      nameRow.textContent = source.name

      const sizeRow = dom.createFromHtml<HTMLDivElement>(
        '<span class="size"></span>'
      )
      sizeRow.textContent = `${(source.fileSize / 1024).toFixed(1)} KB`
      const dimensionsRow = dom.createFromHtml<HTMLDivElement>(
        '<span class="dim"></span>'
      )
      dimensionsRow.textContent = `(${source.width}x${source.height})`

      dom.appends(itemDiv, image, nameRow, sizeRow, dimensionsRow)
      itemDiv.addEventListener('click', () => {
        this._ctx.setActiveImage(source)
      })

      body.appendChild(itemDiv)
    })
    this._setActive()
  }
}
