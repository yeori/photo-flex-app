import { CssSelector } from '..'
import { parseCssSelector } from './css-selector'
const PRIMITIVES = 'number,string,boolean'.split(',')
const isPrimitive = (o: unknown): boolean => PRIMITIVES.includes(typeof o)

const isFunction = (o: any): boolean => typeof o === 'function'

const deepClone = <T = unknown>(src: T): T => {
  if (
    src === undefined ||
    src === null ||
    isPrimitive(src) ||
    isFunction(src)
  ) {
    return src
  }
  if (Array.isArray(src)) {
    return src.map(deepClone) as T
  }
  const dst = {} as T
  Object.keys(src).forEach((key) => {
    const prop = key as keyof T
    const value = deepClone(src[prop])
    dst[prop] = value
  })
  return dst
}

const rand = (iter: number) => {
  const keys = []
  keys.push(Date.now().toString(36).substring(2))
  for (let i = 0; i < iter; i++) {
    keys.push(Math.random().toString(36).substring(2))
  }
  return keys.join('-')
}
export class DomUtil {
  isPrimitve(value: unknown) {
    return isPrimitive(value)
  }
  isFunction(value: unknown) {
    return isFunction(value)
  }
  /**
   * copy all properties from src to dst recursively
   * @param src
   * @param dst
   * @returns dst
   */
  deepClone<T>(src: T) {
    return deepClone(src)
  }
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
    const { data, attr } = spec
    if (data) {
      Object.keys(data).forEach((key) => {
        const prop = this.toCameCase(key)
        elem.dataset[prop] = data[key]
      })
    }
    if (attr) {
      Object.keys(attr).forEach((key) => {
        elem.setAttribute(key, attr[key])
      })
    }
    if (parentEl) {
      parentEl.appendChild(elem)
    }
    return elem
  }

  /**
   * set value in `dataset` of an element.
   * @param el target element
   * @param key dataset property name
   * @param value dataset value
   */
  bindDataset(el: HTMLElement, key: string, value: string) {
    const prop = this.toCameCase(key)
    el.dataset[prop] = value
  }
  /**
   * convert 'some-prop-name' to 'somePropName'
   * @param text dashed string
   * @returns camel-case string
   */
  toCameCase(text: string): string {
    return text
      .split('-')
      .map((part, i) => {
        if (i === 0) {
          return part
        }
        return part[0].toUpperCase() + part.substring(1)
      })
      .join('')
  }
  /**
   * find an element, supplied element or null
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
    const elems = this.finds(el, selector)
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
  randomKey() {
    return crypto.randomUUID ? crypto.randomUUID() : rand(3)
  }
}
export const dom = new DomUtil()
