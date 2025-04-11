import { describe, it, expect, beforeEach } from 'vitest'
import { DomUtil } from './index'

describe('DomUtil', () => {
  let dom: DomUtil
  let root: HTMLElement

  beforeEach(() => {
    dom = new DomUtil()
    root = document.createElement('div')
    document.body.appendChild(root)
  })
  it('create element from the css selector', () => {
    const elem = dom.create('p#para.one.two')
    expect(elem).toBeDefined()
    expect(elem.id).toBe('para')
    expect(elem.classList.contains('one')).toBeTruthy()
    expect(elem.classList.contains('two')).toBeTruthy()
    expect(root.querySelector('#para')).toBeNull()
  })
  it('create element and append to root', () => {
    const elem = dom.create('p#para.one.two', root)
    expect(elem.id).toEqual('para')
    expect(root.querySelector('#para')!.id).toEqual('para')
  })

  it('finds elements when they exist', () => {
    const [elem1, elem2] = dom.creates(root, 'p.my-class.one', 'p.two.my-class')
    const result = dom.finds<HTMLParagraphElement>(root, '.my-class')
    expect(result.length).toBe(2)
    expect(result).toContain(elem1)
    expect(result).toContain(elem2)
    expect(root.querySelector('.one')).not.toBeNull()
    expect(root.querySelector('.two')).not.toBeNull()
    expect(root.querySelector('.three')).toBeNull()
  })

  it('an empty array when no elements are found', () => {
    const result = dom.finds<HTMLParagraphElement>(root, '.my-class')
    expect(result.length).toBe(0)
  })

  describe('findOne', () => {
    it('existing element', () => {
      const elem = document.createElement('p')
      elem.id = 'my-element'
      root.appendChild(elem)

      const result = dom.findOne<HTMLParagraphElement>(root, '#my-element')
      expect(result).toBe(elem)
    })

    it('null when no element is found', () => {
      const result = dom.findOne<HTMLParagraphElement, undefined>(root, '#my-element')
      expect(result).toBeNull()
    })

    it('supplied element when no element is found', () => {
      const result = dom.findOne<HTMLParagraphElement>(root, '#my-element', () =>
        document.createElement('p')
      )
      expect(result).toBeDefined()
      // expect(result.id).toBe('my-element')
    })

    it('appends supplied element when no element is found and supply is provided', () => {
      dom.findOne<HTMLParagraphElement>(root, 'p', () => document.createElement('p'))
      expect(root.querySelector('p')).not.toBeNull()
    })

    it('an error for multiple elements', () => {
      dom.creates<HTMLParagraphElement>(root, 'p.one', 'p.one')
      expect(() => dom.findOne<HTMLParagraphElement>(root, '.one')).toThrowError()
    })
    it('returns the element of type defined', () => {
      const elem = dom.create('#my-elem', root)
      const result = dom.findOne<HTMLDivElement>(root, '#my-elem')
      expect(result).toBe(elem)
    })
  })
})
