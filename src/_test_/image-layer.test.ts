import { beforeEach, describe, expect, test } from 'vitest'
import { ImageLayer } from '../image-layer'
import { ImageSource } from '../image-source'

const canvas = { width: 400, height: 300 }
const image = { width: 600, height: 600 } as ImageSource
describe('layer.rect', () => {
  let layer: ImageLayer
  beforeEach(() => {
    layer = ImageLayer.create(
      image,
      (c) => ({
        x: c.x + canvas.width / 2,
        y: c.y + canvas.height / 2,
      }),
      { x: 0, y: 0 },
      1
    )
  })
  test('ratio: 1', () => {
    let rect = layer.getImageRect(canvas)
    expect(rect).toEqual({
      cx: 300,
      cy: 300,
      left: 100,
      right: 500,
      top: 150,
      bottom: 450,
      width: canvas.width,
      height: canvas.height,
    })
    layer.setOffset(100, 150)
    rect = layer.getImageRect(canvas)
    expect(rect).toEqual({
      cx: 200,
      cy: 150,
      left: 0,
      right: 400,
      top: 0,
      bottom: 300,
      width: canvas.width,
      height: canvas.height,
    })
  })
  test('ratio: 1, top left', () => {
    layer.setOffset(-100, -150)
    expect(layer.getImageRect(canvas)).toEqual({
      cx: 400,
      cy: 450,
      left: 200,
      right: 600,
      top: 300,
      bottom: 600,
      width: canvas.width,
      height: canvas.height,
    })
  })
  test('ratio: 2', () => {
    layer.setScale(2)
    let rect = layer.getImageRect(canvas)
    expect(rect).toEqual({
      cx: 300,
      cy: 300,
      left: 200,
      right: 400,
      top: 300 - 150 / 2,
      bottom: 300 + 150 / 2,
      width: canvas.width / 2,
      height: canvas.height / 2,
    })
  })
})
