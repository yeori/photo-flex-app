import { CssSelector } from '..'

export type DomAttr = {
  tag: string
  id: string
  class: string[]
}
/**
 * parse css selector
 * @example `p#my-id.one.two` is parsed to {tag: 'p', id: 'my-id', class: ['one', 'tow']}
 * @param selector css selector syntax
 */
export const parseCssSelector = (selector: CssSelector): DomAttr => {
  const ret: DomAttr = { tag: '', id: '', class: [] }
  const matches = selector.matchAll(/([#\.])?([a-zA-Z0-9-_]+)/g)
  for (const match of matches) {
    const [_, prefix, name] = match
    if (prefix === '#') {
      ret.id = name
    } else if (prefix === '.') {
      ret.class.push(name)
    } else {
      ret.tag = name
    }
  }
  if (ret.tag === '') {
    ret.tag = 'div'
  }
  return ret
}
