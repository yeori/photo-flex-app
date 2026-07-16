import { type IView } from '.'
import { type PhotoFlexContext } from '../photo-flex-context'
import { dom } from '../util'

export class CaptureEffectView implements IView {
  private _container: HTMLElement | null = null
  private _wrapper: HTMLDivElement | null = null

  constructor(private readonly _ctx: PhotoFlexContext) {}

  get name() {
    return 'capture-effect-view'
  }

  bindTo(container: HTMLElement): void {
    this._container = container

    // Create wrapper with data attribute
    const wrapper = (this._wrapper = dom.create<HTMLDivElement>('div'))
    dom.bindDataset(wrapper, 'photoflex-capture-effect-view', '')

    // Create Capture button
    const btn = dom.create<HTMLButtonElement>('button')
    btn.className = 'pf-capture-btn'

    // Retrieve custom configurations (label, icon) from parameter context
    const viewParam = this._ctx.paramContext.views.find(
      (v) => v.name === 'capture-effect-view'
    )
    const payload =
      viewParam && 'payload' in viewParam ? viewParam.payload : undefined
    const label = payload?.label
    const icon = payload?.icon

    if (icon) {
      this._ctx.decorateAction('capture-effect-view', btn, icon)
      const iconEl = btn.querySelector('span, img')
      if (iconEl) {
        iconEl.className = 'photoflex-view-icon'
      }
      if (label) {
        const textSpan = dom.create('span')
        textSpan.innerText = label
        dom.style(textSpan, {
          marginLeft: '8px',
          verticalAlign: 'middle'
        })
        btn.appendChild(textSpan)
      } else {
        btn.classList.add('icon-only')
      }
    } else {
      btn.innerText = label ?? 'Capture'
    }

    // Bind click event
    btn.addEventListener('click', () => {
      this._triggerCaptureWithEffect()
    })

    wrapper.appendChild(btn)
    container.appendChild(wrapper)

    // Set initial visibility based on viewport layer status
    this._updateVisibility()

    // Subscribe to viewport events to update visibility dynamically
    this._ctx.subscribe('open', () => {
      this._updateVisibility()
    })
    this._ctx.subscribe('source', (event) => {
      if (event.type === 'deleted' || event.type === 'activated') {
        this._updateVisibility()
      }
    })
  }

  private _updateVisibility() {
    if (!this._wrapper) return
    const layers = this._ctx.getFlex().getLayers()
    if (layers.length > 0) {
      dom.style(this._wrapper, { display: '' })
    } else {
      dom.style(this._wrapper, { display: 'none' })
    }
  }

  private _triggerCaptureWithEffect() {
    if (!this._container) return

    // 1. Run actual capture
    this._ctx.op.sendCapture()

    // 2. Flash effect (white screen overlay flash)
    const flash = dom.create('div')
    flash.className = 'pf-capture-flash'
    this._container.appendChild(flash)

    // Remove flash element after animation ends
    flash.addEventListener('animationend', () => {
      flash.remove()
    })

    // 3. Ripple effect (expanding ripple from center)
    const ripple = dom.create('div')
    ripple.className = 'pf-capture-ripple'
    this._container.appendChild(ripple)

    ripple.addEventListener('animationend', () => {
      ripple.remove()
    })
  }


}
