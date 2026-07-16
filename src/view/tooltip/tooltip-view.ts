import { type IView } from '..'
import { type PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'
import { TooltipData } from './tooltip-data'

export class TooltipView implements IView {
  private _tooltipBoxEl: HTMLDivElement
  private _activeTooltip: TooltipData | null = null
  private readonly _tooltipSelector: string = '[data-photoflex-tooltip]'

  private readonly SHOW_DELAY = 250
  private readonly HIDE_DELAY = 100

  constructor(_ctx: PhotoFlexContext) {
    this._tooltipBoxEl = dom.create<HTMLDivElement>(
      'div[data-photoflex-tooltip-box]'
    )
  }
  get name() {
    return 'tooltip-view'
  }

  /**
   * Binds the tooltip handler to the actions container element.
   * @param container The parent element
   */
  bindTo(container: HTMLElement): void {
    container.addEventListener('mouseover', this.handleMouseOver)
    container.addEventListener('mouseout', this.handleMouseOut)

    container.appendChild(this._tooltipBoxEl)
    document.body.addEventListener('mouseover', this.handleBodyMouseOver)
    document.body.addEventListener('mouseout', this.handleBodyMouseOut)
  }

  /**
   * Handles mouseover events.
   * @param event The MouseEvent.
   */
  private handleMouseOver = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const elem = target.closest(this._tooltipSelector) as HTMLElement
    if (!elem) {
      return
    }

    const { photoflexTooltip: tooltipText } = elem?.dataset

    if (tooltipText && this._activeTooltip?.actionElement !== elem) {
      this.showTooltip(elem, tooltipText, this.SHOW_DELAY, this.HIDE_DELAY)
    } else if (!elem && this._activeTooltip) {
      this._activeTooltip.hide()
    }
  }

  /**
   * Handles mouseout events.
   * @param event The MouseEvent.
   */
  private handleMouseOut = (event: MouseEvent): void => {
    const relatedTarget = event.relatedTarget as Node | null
    if (
      this._activeTooltip &&
      !this._activeTooltip.actionElement.contains(relatedTarget)
    ) {
      this.hideAndDisposeActiveTooltip()
    }
  }

  /**
   * Hides tooltip if mouse moves outside the bound container.
   */
  private handleBodyMouseOver = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const actionElement = target.closest(
      this._tooltipSelector
    ) as HTMLElement | null
    if (!actionElement && this._activeTooltip) {
      this._activeTooltip.hide()
    }
  }

  /**
   * Ensures tooltip is hidden if mouse leaves the document.
   */
  private handleBodyMouseOut = (event: MouseEvent): void => {
    if (event.relatedTarget === null) {
      this.hideAndDisposeActiveTooltip()
    }
  }

  /**
   * Helper to hide and dispose the currently active hover tooltip.
   */
  private hideAndDisposeActiveTooltip(): void {
    if (this._activeTooltip) {
      this._activeTooltip.hide()
      this._activeTooltip = null
    }
  }

  createTooltip(
    elem: HTMLElement,
    text: string,
    dir: 'top' | 'center' | 'bottom',
    showDelay?: number,
    hideDelay?: number
  ): TooltipData {
    return new TooltipData(
      this._tooltipBoxEl,
      elem,
      text,
      dir,
      showDelay !== undefined ? showDelay : this.SHOW_DELAY,
      hideDelay !== undefined ? hideDelay : this.HIDE_DELAY
    )
  }

  /**
   * Shows a tooltip for a given element
   * @param elem The HTML element to attach the tooltip to.
   * @param text The tooltip text.
   * @param showDelay The delay before showing the tooltip.
   * @param hideDelay The delay before hiding the tooltip.
   */
  showTooltip(
    elem: HTMLElement,
    text: string,
    showDelay?: number,
    hideDelay?: number
  ): TooltipData {
    if (this._activeTooltip) {
      this._activeTooltip.dispose()
      this._activeTooltip = null
    }

    const tooltip = this.createTooltip(
      elem,
      text,
      'bottom',
      showDelay,
      hideDelay
    )

    this._activeTooltip = tooltip

    tooltip.show(text, 0)
    return tooltip
  }

  /**
   * Disposes the tooltip view.
   */
  dispose(): void {
    this.hideAndDisposeActiveTooltip()

    document.body.removeEventListener('mouseover', this.handleBodyMouseOver)
    document.body.removeEventListener('mouseout', this.handleBodyMouseOut)

    if (this._tooltipBoxEl && this._tooltipBoxEl.parentElement) {
      this._tooltipBoxEl.parentElement.removeChild(this._tooltipBoxEl)
    }
    console.log('TooltipView disposed.')
  }
}
