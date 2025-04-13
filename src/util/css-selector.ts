import { CssSelector } from '..'

export type DomAttr = {
  tag: string
  id: string
  class: string[]
  data?: Record<string, string>
  attr?: Record<string, string>
}
/**
 * parse css selector
 * @example `p#my-id.one.two` is parsed to {tag: 'p', id: 'my-id', class: ['one', 'tow']}
 * @param selector css selector syntax
 */
export const parseCssSelector = (selector: CssSelector): DomAttr => {
  if (!selector) {
    throw new Error('Invalid selector')
  }
  const ret: DomAttr = { tag: 'div', id: '', class: [] }
  const tagMatch = selector.match(/^[a-zA-Z][\w-]*/)
  const tag = tagMatch ? tagMatch[0] : undefined

  const idMatch = selector.match(/#([\w-]+)/)
  const id = idMatch ? idMatch[1] : undefined

  const classMatches = [...selector.matchAll(/\.([\w-]+)/g)]
  const classList = classMatches.map((m) => m[1])

  console.log(selector, 'tag:', tag)
  if (tag) {
    ret.tag = tag
  }
  ret.class = classList

  ret.id = id || ''

  const data: Record<string, string> = {}
  const attr: Record<string, string> = {}
  const attrRegex = /\[([\w-]+)(?:=([^\]]+))?\]/g
  let m
  while ((m = attrRegex.exec(selector)) !== null) {
    let key = m[1]
    const isDataAttr = key.startsWith('data-')
    if (isDataAttr) {
      key = key.substring('data-'.length)
    }
    const value = m[2]?.replace(/^['"]|['"]$/g, '') ?? ''
    const target = isDataAttr ? data : attr
    target[key] = value
  }
  if (Object.keys(data).length > 0) {
    ret.data = data
  }
  if (Object.keys(attr).length > 0) {
    ret.attr = attr
  }
  return ret
}
