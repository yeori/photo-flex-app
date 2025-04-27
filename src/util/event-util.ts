export type Unsubscriber = () => void

export class EventUtil {
  /**
   * Attaches an event listener to an element.
   * @param el The element to attach the listener to.
   * @param event The event type (e.g., "click", "mouseover").
   * @param listener The event listener function.
   * @returns An unsubscriber function to remove the listener.
   */
  on<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    event: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ): Unsubscriber {
    el.addEventListener(event, listener)
    return () => {
      el.removeEventListener(event, listener)
    }
  }

  /**
   * Attaches a click event listener to a parent element and triggers the listener if the clicked element matches the given CSS selector.
   * @param el The parent element to attach the listener to.
   * @param selector The CSS selector to match against the clicked element.
   * @param listener The event listener function to be called when a click event occurs on a matching element.
   * @returns An unsubscriber function to remove the listener.
   */
  click(
    el: EventTarget,
    selector: string,
    listener: (this: EventTarget, ev: HTMLElementEventMap['click']) => void
  ): Unsubscriber {
    const clickListener = (e: MouseEvent) => {
      let target = (e.target as HTMLElement)!
      if (target.closest(selector)) {
        listener.call(el, e as HTMLElementEventMap['click'])
      }
    }
    ;(el as HTMLElement).addEventListener('click', clickListener)
    return () => {
      ;(el as HTMLElement).removeEventListener('click', clickListener)
    }
  }

  /**
   * Manages transition events for a group of elements.
   *
   * This method allows you to handle 'transitionstart' and 'transitionend' events
   * for multiple elements simultaneously. It also provides an optional 'trigger' callback
   * that is invoked for each element.
   * @param els An array of HTMLElements that will undergo transitions.
   * @param listeners An object containing optional callback functions for 'trigger', 'start', and 'end' transition events.
   */
  transition(
    els: HTMLElement[],
    listeners: {
      trigger?: (el: HTMLElement) => void
      start?: (el: HTMLElement, ev: TransitionEvent) => void
      end?: (el: HTMLElement, ev: TransitionEvent, end: boolean) => void
    }
  ) {
    const { trigger: ready } = listeners
    if (ready) {
      els.forEach((el) => {
        ready(el)
      })
    }
    setTimeout(() => {
      let cnt = 0
      let total = 0
      const { start, end } = listeners
      els.forEach((el) => {
        if (start) {
          const unsub = this.on(el, 'transitionstart', (ev) => {
            start(el, ev)
            unsub()
          })
        }
        if (end) {
          total++
          const unsub = this.on(el, 'transitionend', (ev) => {
            cnt++
            end(el, ev, total === cnt)
            unsub()
          })
        }
      })
    })
  }
}
