import { describe, expect, it } from 'vitest'
import { Viewport } from './'
import { scaleByContain } from './scale-by-contain'

describe('contain', () => {
  const viewport: Viewport = { width: 400, height: 400 }
  it('(800, 200) => (400, 100)', () => {
    /**
     * sw: 800 sh: 200
     * vw: 400 vh: 400
     * rw: 0.5 rh: 2
     */
    const ratio = scaleByContain({ width: 800, height: 200 }, viewport)
    expect(ratio).toBe(0.5)
    // expect(view).toEqual({ x: 0, y: 150, width: 400, height: 100 })
  })
  it('(200, 800) => (100, 400)', () => {
    /**
     * sw: 200 sh: 800
     * vw: 400 vh: 400
     * rw: 2   rh: .5
     */
    const ratio = scaleByContain({ width: 200, height: 800 }, viewport)
    expect(ratio).toBe(0.5)
    // expect(view).toEqual({ x: 150, y: 0, width: 100, height: 400 })
  })
  it('(600, 800) => (300, 400)', () => {
    /**
     * sw: 600 sh: 800
     * vw: 400 vh: 400
     * rw: .67 rh: .5
     */
    const ratio = scaleByContain({ width: 600, height: 800 }, viewport)
    expect(ratio).toBe(0.5)
    // expect(view).toEqual({ x: 50, y: 0, width: 300, height: 400 })
  })
})
