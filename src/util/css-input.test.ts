import { describe, it, expect } from 'vitest'
import { parseCssSelector } from './css-selector'

describe('input', () => {
  it('input[type=range]', () => {
    const spec = parseCssSelector('input[type=range]')
    expect(spec.attr).toEqual({ type: 'range' })
  })
})
