// app/src/view/tooltip-data.ts

import { dom } from '../../util'

/**
 * Holds data and manages the lifecycle of a single tooltip instance.
 */
export class TooltipData {
  public readonly tooltipElement: HTMLDivElement
  private _showTimer: number | undefined = undefined
  private _hideTimer: number | undefined = undefined

  /**
   * @param actionElement The HTML element that triggered the tooltip.
   * @param tooltipText The text to display in the tooltip.
   * @param showDelay Delay in ms before showing.
   * @param hideDelay Delay in ms before hiding.
   */
  constructor(
    public readonly actionElement: HTMLElement,
    public readonly tooltipText: string,
    private readonly showDelay: number,
    private readonly hideDelay: number
  ) {
    this.tooltipElement = dom.create<HTMLDivElement>(
      'div[data-photoflex-tooltip-item]'
    )
    this.tooltipElement.textContent = this.tooltipText
  }

  /**
   * Starts the timer to show the tooltip.
   * @param container The container element
   */
  startShowTimer(container: HTMLElement): void {
    this.clearTimers()

    this._showTimer = setTimeout(() => {
      container.appendChild(this.tooltipElement)
      this.updatePosition()
      this.tooltipElement.style.opacity = '1'
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
  updatePosition(): void {
    const rect = this.actionElement.getBoundingClientRect()
    this.tooltipElement.style.left = `${rect.left}px`
    this.tooltipElement.style.top = `${rect.bottom + 5}px`

    const tooltipRect = this.tooltipElement.getBoundingClientRect()
    if (tooltipRect.right > window.innerWidth) {
      this.tooltipElement.style.left = `${rect.right - tooltipRect.width}px`
    }
    if (tooltipRect.bottom > window.innerHeight) {
      this.tooltipElement.style.top = `${rect.top - tooltipRect.height - 5}px`
    }
  }

  /**
   * Hides the tooltip and removes its element from the DOM.
   */
  hideImmediately(): void {
    if (this.tooltipElement.parentElement) {
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
    if (this.tooltipElement.parentElement) {
      this.tooltipElement.parentElement.removeChild(this.tooltipElement)
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
