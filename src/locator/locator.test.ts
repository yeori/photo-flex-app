import { describe, it, expect } from 'vitest'
import { locateOnCenter } from './locate-on-center'

describe('locateOnCenter', () => {
  // const viewport = { width: 200, height: 100 }
  const leftTop = { x: 0, y: 0 }
  const center = { x: 100, y: 50 }
  const rightBottom = { x: 200, y: 100 }
  it('locateOnCenter', () => {
    const s50x30 = { width: 50, height: 30 }
    let area = locateOnCenter(s50x30, leftTop, 1)
    expect(area).toEqual({ x: -25, y: -15, width: 50, height: 30 })

    area = locateOnCenter({ width: 200, height: 100 }, { x: 100, y: 50 }, 1)
    expect(area).toEqual({ x: 0, y: 0, width: 200, height: 100 })

    area = locateOnCenter({ width: 300, height: 150 }, leftTop, 1)
    expect(area).toEqual({ x: -150, y: -75, width: 300, height: 150 })

    area = locateOnCenter({ width: 300, height: 150 }, center, 1)
    expect(area).toEqual({ x: -50, y: -25, width: 300, height: 150 })

    area = locateOnCenter({ width: 300, height: 150 }, rightBottom, 1)
    expect(area).toEqual({ x: 50, y: 25, width: 300, height: 150 })
  })
})
