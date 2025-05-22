import { dom } from '../../util'

/**
 * Holds data and manages the lifecycle of a single tooltip instance.
 */
export class TooltipData {
  private readonly tooltipElement: HTMLElement
  private _showTimer: number | undefined = undefined
  private _hideTimer: number | undefined = undefined

  /**
   * @param boxEl The parent element where the tooltip will be displayed.
   * @param actionElement The HTML element that triggered the tooltip.
   * @param tooltipText The text to display in the tooltip.
   * @param showDelay Delay in ms before showing.
   * @param hideDelay Delay in ms before hiding.
   */
  constructor(
    readonly boxEl: HTMLElement,
    readonly actionElement: HTMLElement,
    tooltipText: string,
    readonly dir: 'top' | 'center' | 'bottom',
    private readonly showDelay: number,
    private readonly hideDelay: number
  ) {
    this.tooltipElement = dom.create<HTMLDivElement>(
      'div[data-photoflex-tooltip-item]'
    )
    this.setText(tooltipText)
  }
  setText(text: string) {
    this.tooltipElement.textContent = text
  }

  private hideAfter(millis: number) {
    if (this._hideTimer !== undefined) {
      clearTimeout(this._hideTimer)
    }
    this._hideTimer = setTimeout(() => {
      this.hideImmediately()
    }, millis)
  }
  /**
   * Starts the timer to show the tooltip. If durationMillis is given, tooltip is removed after that time.
   */
  show(durationMillis?: number): void {
    if (durationMillis) {
      this.hideAfter(durationMillis)
    }
    if (this._showTimer) {
      return
    }
    this.clearTimers()

    this._showTimer = setTimeout(() => {
      this.boxEl.appendChild(this.tooltipElement)
      this.setPosition()
      this.tooltipElement.style.opacity = '1'
      if (durationMillis) {
        this.hideAfter(durationMillis)
      }
    }, this.showDelay)
  }

  /**
   * Starts the timer to hide the tooltip.
   */
  hide(): void {
    this.clearTimers()

    this._hideTimer = setTimeout(() => {
      this.hideImmediately()
    }, this.hideDelay)
  }

  /**
   * Updates the tooltip position
   */
  private setPosition(): void {
    const rect = this.actionElement.getBoundingClientRect()
    let top: number = 0

    switch (this.dir) {
      case 'top':
        top = rect.top - this.tooltipElement.offsetHeight - 5
        break
      case 'center':
        top = rect.top + (rect.height - this.tooltipElement.offsetHeight) / 2
        break
      case 'bottom':
      default:
        top = rect.bottom + 5
        break
    }
    this.tooltipElement.style.left = `${
      rect.left + (rect.width - this.tooltipElement.offsetWidth) / 2
    }px`
    this.tooltipElement.style.top = `${top}px`
    if (rect.right > window.innerWidth) {
      this.tooltipElement.style.left = `${rect.right - rect.width}px`
    }
    if (rect.bottom > window.innerHeight) {
      this.tooltipElement.style.top = `${rect.top - rect.height - 5}px`
    }
  }

  /**
   * Hides the tooltip and removes its element from the DOM.
   */
  hideImmediately(): void {
    if (this.boxEl) {
      this.tooltipElement.style.opacity = '0'
      const transitionEndHandler = () => {
        this.removeElement()
        this.tooltipElement.removeEventListener(
          'transitionend',
          transitionEndHandler
        )
      }
      this.tooltipElement.addEventListener(
        'transitionend',
        transitionEndHandler
      )
    } else {
      this.clearTimers()
    }
  }

  /**
   * Removes the tooltip element from DOM.
   */
  removeElement(): void {
    if (this.boxEl && this.tooltipElement.parentElement === this.boxEl) {
      this.boxEl.removeChild(this.tooltipElement)
    }
    this.clearTimers()
  }

  /**
   * Clears both show and hide timers.
   */
  clearTimers(): void {
    if (this._showTimer !== undefined) {
      clearTimeout(this._showTimer)
      this._showTimer = undefined
    }
    if (this._hideTimer !== undefined) {
      clearTimeout(this._hideTimer)
      this._hideTimer = undefined
    }
  }

  /**
   * Disposes the TooltipData instance, clearing timers and removing the element.
   */
  dispose(): void {
    this.clearTimers()
    this.removeElement()
  }
}
