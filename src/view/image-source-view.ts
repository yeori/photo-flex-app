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
  private _visible: boolean = true
  private templates = {
    menu: `<menu data-photoflex-image-sources class="visible">
  <div>
    <button data-photoflex-action data-cmd="hide" class="white"><span class="material-symbols-outlined">close</span></button>
  </div><div class="inner"></div></menu>`,
    item: `<li tabindex="0" role="button" data-photoflex-image-item></li>`,
    close: `<button data-photoflex-action data-cmd="delete"><span class="material-symbols-outlined">close</span></button>`,
  }
  constructor(private readonly _ctx: PhotoFlexContext) {
    this._container = dom.createFromHtml<HTMLDivElement>(this.templates.menu)
  }
  private get bodyEl() {
    return this._container.querySelector('.inner')!
  }

  /**
   * Attaches this view to a container element.
   * @param container The HTML element to attach to.
   */
  bindTo(container: HTMLElement): void {
    this.hide()
    this._ctx.subscribe('source', (event) => {
      this.update(container, event)
    })
  }
  // FIXME menu 컴포넌트로 옮겨야 함.
  private _bindButtonEvent(container: HTMLElement): void {
    dom.event.click(this._container, 'button[data-cmd="hide"]', (e) => {
      const btn = (e.target as HTMLButtonElement).closest('button')
      if (!btn) {
        return
      }
      const { cmd } = btn.dataset
      if (cmd === 'open') {
        this.render(container)
      } else if (cmd === 'hide') {
        this.hide()
      }
    })
    dom.event.click(this.bodyEl, '[data-cmd="delete"]', (e) => {
      e.stopPropagation()
      e.stopImmediatePropagation()
      const li = dom.closest<HTMLLIElement>(e.target as HTMLLIElement, 'li')
      if (!li) {
        return
      }
      // this.hide()
      const { uuid } = li.dataset
      let idx = this._sources.findIndex((img) => img.uuid === uuid)
      if (idx + 1 === this._sources.length) {
        idx--
      } else {
        idx++
      }
      const activeImage = this._sources[idx]

      if (uuid) {
        this._ctx.op.removeImage(uuid, activeImage?.uuid)
      }
    })
    dom.event.click(this.bodyEl, 'li', (e) => {
      e.stopPropagation()
      const li = dom.closest<HTMLLIElement>(e.target as HTMLLIElement, 'li')
      if (!li) {
        return
      }
      const { uuid } = li.dataset
      if (uuid) {
        this._ctx.setActiveImage(uuid)
      }
    })
  }
  /**
   * Updates the view based on source events (add, remove, clear).
   * @param event The SourceEvent object.
   */
  private update(parentEl: HTMLElement, event: SourceEvent): void {
    //Refactor: use correct type SourceEvent
    switch (event.type) {
      case 'added':
        if (event.sources) {
          this._sources.push(...event.sources)
        }
        this.render(parentEl)
        break
      case 'deleted':
        if (event.sources) {
          const uuids = new Set<string>(event.sources.map((e) => e.uuid))
          this._sources = this._sources.filter((s) => !uuids.has(s.uuid))
          this.render(parentEl)
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
  private render(parentEl: HTMLElement): void {
    parentEl.appendChild(this._container)
    dom.emptify(this.bodyEl)
    this.bodyEl.classList.remove('empty')
    this.show()
    this._bindButtonEvent(parentEl)

    if (this._sources.length === 0) {
      this.bodyEl.classList.add('empty')
      this.bodyEl.textContent = 'Empty'
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
        const scale = Math.min(size / source.width, size / source.height)
        const scaledWidth = source.width * scale
        const scaledHeight = source.height * scale

        const offsetX = (size - scaledWidth) / 2
        const offsetY = (size - scaledHeight) / 2
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
      // itemDiv.addEventListener('click', (e) => {
      //   console.log(e.target)
      //   this._ctx.setActiveImage(source.uuid)
      // })
      setTimeout(() => {
        this.bodyEl.appendChild(itemDiv)
      })
    }) // end forEach
    setTimeout(() => {
      this._setActive()
    })
  }
  show() {
    if (!this._visible) {
      this._container.classList.add('visible')
      this._visible = true
    }
  }
  hide() {
    if (this._visible) {
      this._visible = false
      const onEnd = () => {
        dom.emptify(this.bodyEl)
        this._container.removeEventListener('transitionend', onEnd)
        this._container.remove()
      }
      if (this._container.parentElement) {
        this._container.addEventListener('transitionend', onEnd)
      }
      this._container.classList.remove('visible')
    }
  }
}
