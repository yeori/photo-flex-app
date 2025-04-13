import { describe, expect, it } from 'vitest'
import { parseCssSelector } from './css-selector'

describe('parseCssSelector', () => {
  it('data-attribute', () => {
    const selector = '[data-marker][data-uuid="abcd"]'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'div',
      id: '',
      class: [],
      data: { marker: '', uuid: 'abcd' },
    })
  })
  it('normal-attribute', () => {
    const selector = 'input[type=text]'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'input',
      id: '',
      class: [],
      attr: { type: 'text' },
    })
  })
})
