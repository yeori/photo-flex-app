import { CssSelector } from '..'
import { parseCssSelector } from './css-selector'

export class DomUtil {
  /**
   * create multiple elements from the css selector syntax. If parentEl is given, the new elements will be appended to it.
   * @param selectors css selector syntax for elements
   * @param parentEl
   */
  creates<T extends HTMLElement = HTMLElement>(
    parentEl: HTMLElement,
    ...selectors: CssSelector[]
  ) {
    if (selectors.length === 0) {
      return []
    }
    return selectors.map((selector) => this.create<T>(selector, parentEl))
  }
  /**
   * create an element from the css selector syntax. If parentEl is given, the new element will be appended to it.
   * @param selector css selector syntax
   * @param parentEl
   * @returns new element
   */
  create<T extends HTMLElement = HTMLElement>(
    selector: CssSelector,
    parentEl?: HTMLElement
  ) {
    const spec = parseCssSelector(selector)
    const elem = document.createElement(spec.tag) as T
    if (spec.id) {
      elem.id = spec.id
    }
    if (spec.class.length > 0) {
      elem.classList.add(...spec.class)
    }
    if (parentEl) {
      parentEl.appendChild(elem)
    }
    return elem
  }
  /**
   * find an element, or supplied element or null
   * @param el - parent element
   * @param selector - css selector syntax
   * @param supply - used if no element is found
   * @returns found element, null(if no `supply` is provided), or value from supply()
   * @throws if multiple elements are found
   */
  findOne<
    T extends HTMLElement = HTMLElement,
    S extends undefined | (() => T) = () => T
  >(
    el: HTMLElement,
    selector: string,
    supply?: () => T
  ): S extends undefined ? T | null : T {
    const elems = this.finds(el, selector) // el.querySelectorAll(selector)
    if (elems.length === 0) {
      const elem = supply
        ? supply()
        : (null as S extends undefined ? T | null : T)
      if (elem) {
        el.appendChild(elem)
      }
      return elem
    } else if (elems.length === 1) {
      return elems[0] as T
    }
    throw new Error('multiple elements found: ' + elems.length, {
      cause: 'DUP_ELEMENT',
    })
  }
  /**
   * find any elements matching the css `selector`
   * @param el - parent element
   * @param selector - css selector syntax
   */
  finds<T extends HTMLElement = HTMLElement>(
    el: HTMLElement,
    selector: string
  ): T[] {
    return Array.from(el.querySelectorAll(selector)) as T[]
  }
  /**
   * parse a unit value like '450px', '400rem' etc into [450, 'px'], [400, 'rem']
   * @param value size value like '450px', '400rem', '100%' etc
   */
  parseUnit(value: string): [number, string] {
    const m = value.trim().match(/^(\d+(?:\.\d+)?)(.*)$/)
    if (m === null) {
      throw new Error('bad unit value: ' + value)
    }
    return [Number(m[1]), m[2]]
  }
}
export const dom = new DomUtil()
