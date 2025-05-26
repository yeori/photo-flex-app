import { PhotoFlexContext } from '../photo-flex-context'
import { dom } from '../util'

export class DimensionSelector extends HTMLElement {
  private dimensions = [
    { width: 320, height: 320 },
    { width: 480, height: 480 },
    { width: 640, height: 640 },
  ]

  constructor(
    readonly ctx: PhotoFlexContext,
    dimensions?: { width: number; height: number }[]
  ) {
    super()
    // this.attachShadow({ mode: 'open' })
    if (dimensions) {
      this.dimensions = dimensions
    }
    this.render()
  }

  private _renderDimension(menu: HTMLMenuElement) {
    dom.emptify(menu)
    this.dimensions.forEach(({ width, height }, index) => {
      dom.createFromHtml<HTMLButtonElement>(
        `<li>
<button data-photoflex-action class="white dim" data-width='${width}' data-height='${height}'>${width}x${height}</button>
<button data-photoflex-action data-index="${index}" class="white close"><span class="material-symbols-outlined">close</span></button>
<li>`,
        menu
      )
    })
    dom.createFromHtml(
      `<li><input class="dim" type="text" placeholder="ex)640,480"><button data-photoflex-action class="blue add">ADD</button><li>`,
      menu
    )
  }
  private render() {
    const root = this
    const menu = dom.create<HTMLMenuElement>('menu[data-dimension-selector]')
    root.appendChild(menu)
    this._renderDimension(menu)
    dom.event.click(menu, 'button[data-width][data-height]', (e) => {
      const button = e.target as HTMLButtonElement
      const width = parseInt(button.dataset.width || '')
      const height = parseInt(button.dataset.height || '')

      if (width && height) {
        this.dispatchEvent(
          new CustomEvent('dimension-selected', { detail: { width, height } })
        )
        this.ctx.op.resizeViewport(width, height)
      }
    })
    dom.event.click(menu, 'button.close', (e) => {
      const btn = dom.closest<HTMLButtonElement>(
        e.target as HTMLButtonElement,
        'button.close'
      )
      if (!btn) {
        return
      }
      const index = parseInt(btn.dataset.index || '')
      this.dimensions.splice(index, 1)
      this._renderDimension(menu)
    })
    dom.event.click(menu, 'button.add', () => {
      const input = dom.findOne<HTMLInputElement>(menu, 'input.dim')
      const dim = this._parseDimension(input.value)
      if (dim) {
        this.dimensions.push({ width: dim[0], height: dim[1] })
        this._renderDimension(menu)
      }
    })
  }
  /**
   * parse dimension from the value
   * @param value dimension form like "w480,320"
   * @returns length of two array as [width, height]
   */
  private _parseDimension(value: string): [number, number] | undefined {
    const match = value.trim().match(/(^\d+)\W+(\d+$)/)
    if (match) {
      return [parseInt(match[1]), parseInt(match[2])]
    }
    return undefined
  }
}

customElements.define('dimension-selector', DimensionSelector)
