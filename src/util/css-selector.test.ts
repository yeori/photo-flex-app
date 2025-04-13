import { describe, expect, it } from 'vitest'
import { parseCssSelector } from './css-selector'

describe('parseCssSelector', () => {
  it('should parse p#para.one.two', () => {
    const selector = 'p#para.one.two'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'p',
      id: 'para',
      class: ['one', 'two'],
    })
  })

  it('should parse span#span-id', () => {
    const selector = 'span#span-id'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'span',
      id: 'span-id',
      class: [],
    })
  })

  it('should parse .only-class', () => {
    const selector = '.only-class'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'div',
      id: '',
      class: ['only-class'],
    })
  })

  it('should parse div', () => {
    const selector = 'div'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'div',
      id: '',
      class: [],
    })
  })

  it('should parse #only-id', () => {
    const selector = '#only-id'
    const result = parseCssSelector(selector)
    expect(result).toEqual({
      tag: 'div',
      id: 'only-id',
      class: [],
    })
  })
  /*
  `[data-marker][data-uuid="abcd"]`.matchAll(
    /([#\.])?([a-zA-Z0-9-_]+)|([a-zA-Z0-9-_]+)?/g
  )
  */
  // it('data-attribute', () => {
  //   const selector = '[data-marker][data-uuid="abcd"]'
  //   const result = parseCssSelector(selector)
  //   expect(result).toEqual({
  //     tag: 'div',
  //     id: '',
  //     class: [],
  //     data: { marker: '', uuid: 'abcd' },
  //   })
  // })

  it('should throw an error if selector is invalid', () => {
    const invalidSelectors = [undefined, null, '']
    invalidSelectors.forEach((selector) => {
      expect(() => parseCssSelector(selector as any)).toThrowError(
        'Invalid selector'
      )
    })
  })
})
