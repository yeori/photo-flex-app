import { PhotoFlexContext } from '../photo-flex-context'

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
    this.attachShadow({ mode: 'open' })
    if (dimensions) {
      this.dimensions = dimensions
    }
    this.render()
  }

  private render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          button {
            padding: 5px 10px;
            margin: 5px;
            border: 1px solid #ccc;
            background-color: #eee;
            cursor: pointer;
          }
        </style>
        ${this.dimensions
          .map(
            (dim) =>
              `<button data-width='${dim.width}' data-height='${dim.height}'>${dim.width}x${dim.height}</button>`
          )
          .join('')}
      `

      this.shadowRoot.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          const width = parseInt(button.dataset.width || '')
          const height = parseInt(button.dataset.height || '')

          this.dispatchEvent(
            new CustomEvent('dimension-selected', { detail: { width, height } })
          )
          if (width && height) {
            this.ctx.op.resizeViewport(width, height)
          }
        })
      })
    }
  }
}

customElements.define('dimension-selector', DimensionSelector)
