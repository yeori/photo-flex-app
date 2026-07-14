import { AbstractAction } from '.'
import { Unsubscriber } from '../../event'
import type { PhotoFlexContext } from '../../photo-flex-context'
import { ActionParam, ActionIconRender } from '../../types'
import { dom } from '../../util'

export class ActionFit extends AbstractAction {
  private _unsubOpen: Unsubscriber | undefined
  private _unsubZoom: Unsubscriber | undefined
  private _unsubMove: Unsubscriber | undefined

  private _currentMode: 'contain' | 'cover' | 'real' | 'custom' = 'contain'
  private _customScale: number = 1
  private _customOffset: { cx: number; cy: number } = { cx: 0, cy: 0 }
  private _isApplyingFitting: boolean = false

  constructor(_ctx: PhotoFlexContext, param: ActionParam) {
    super(_ctx, param)
  }

  protected createElement(): HTMLButtonElement {
    const btn = dom.createFromHtml<HTMLButtonElement>(
      `<button class="blue" data-photoflex-action aria-label="${this.label}"></button>`
    )
    btn.disabled = true
    return btn
  }

  bindTo(parent: HTMLElement): void {
    super.bindTo(parent)

    this._initializeMode()

    this._unsubOpen = this.context.subscribe('open', () => {
      this._initializeMode()
      this._syncButtonUI()
    })

    this._unsubZoom = this.context.subscribe('zoom', (e) => {
      this._recordCustomState(e)
    })

    this._unsubMove = this.context.subscribe('move', (e) => {
      this._recordCustomState(e)
    })

    this._syncButtonUI()
  }

  private _initializeMode() {
    const initialScale = this.context.paramContext.scaleMode
    if (initialScale === 'cover') {
      this._currentMode = 'cover'
    } else if (initialScale === 'contain') {
      this._currentMode = 'contain'
    } else if (initialScale === 1) {
      this._currentMode = 'real'
    } else {
      this._currentMode = 'contain'
    }

    const flex = this.context.getFlex()
    const layers = flex.getLayers()
    if (layers.length > 0) {
      const layer = layers[0]
      this._customScale = layer.ratio
      const offset = layer.getOffset()
      this._customOffset = { cx: offset.x, cy: offset.y }
    } else {
      this._customScale = 1
      this._customOffset = { cx: 0, cy: 0 }
    }
  }

  private _recordCustomState(e: { ratio: number; offset: { cx: number; cy: number } }) {
    if (this._isApplyingFitting) return

    this._currentMode = 'custom'
    this._customScale = e.ratio
    this._customOffset = { cx: e.offset.cx, cy: e.offset.cy }
    this._syncButtonUI()
  }

  private _getNextMode(currentMode: 'contain' | 'cover' | 'real' | 'custom'): 'contain' | 'cover' | 'real' | 'custom' {
    if (currentMode === 'contain') return 'cover'
    if (currentMode === 'cover') return 'real'
    if (currentMode === 'real') return 'custom'
    return 'contain'
  }

  private _updateButtonUI(nextMode: 'contain' | 'cover' | 'real' | 'custom') {
    if (!this._el) return

    let label = ''
    let tooltip = ''
    let icon: string | ActionIconRender | undefined = undefined

    // 1. Resolve Tooltip / Label
    const paramTooltip = this.param.tooltip
    if (paramTooltip && typeof paramTooltip === 'object') {
      tooltip = paramTooltip[nextMode] || ''
    } else {
      if (nextMode === 'cover') {
        tooltip = 'Switch to Fit Cover'
      } else if (nextMode === 'real') {
        tooltip = 'Switch to Actual Size'
      } else if (nextMode === 'custom') {
        tooltip = 'Switch to Custom Position'
      } else {
        tooltip = 'Switch to Fit Contain'
      }
    }
    label = tooltip

    // 2. Resolve Icon
    const paramIcon = this.param.icon
    if (paramIcon && typeof paramIcon === 'object') {
      icon = (paramIcon as Record<string, string | ActionIconRender>)[nextMode]
    } else {
      if (nextMode === 'cover') {
        icon = 'fullscreen'
      } else if (nextMode === 'real') {
        icon = 'view_real_size'
      } else if (nextMode === 'custom') {
        icon = 'open_with'
      } else {
        icon = 'fit_screen'
      }
    }

    this._el.ariaLabel = label
    this._el.dataset.photoflexTooltip = tooltip

    this._el.innerHTML = ''
    if (icon) {
      this.context.decorateAction(this.id, this._el, icon)
    }
  }

  private _syncButtonUI() {
    const nextMode = this._getNextMode(this._currentMode)
    this._updateButtonUI(nextMode)
  }

  run(): void {
    const nextMode = this._getNextMode(this._currentMode)

    this._isApplyingFitting = true

    if (nextMode === 'contain') {
      this.context.op.fitByContain()
    } else if (nextMode === 'cover') {
      this.context.op.fitByCover()
    } else if (nextMode === 'real') {
      this.context.op.fitToRealSize()
    } else if (nextMode === 'custom') {
      this.context.op.fitByCustom({ scale: this._customScale, offset: this._customOffset })
    }

    setTimeout(() => {
      this._isApplyingFitting = false
    }, 0)

    this._currentMode = nextMode
    this._syncButtonUI()
  }

  dispose(): void {
    this._unsubOpen?.()
    this._unsubZoom?.()
    this._unsubMove?.()
  }
}
