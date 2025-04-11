import { ScaleData, Viewport } from '.'

export const scaleByCustom = (src: Viewport, view: Viewport): ScaleData => {
  const { width, height } = src
  const { width: canvasWidth, height: canvasHeight } = view
  return {
    subject: { x: 0, y: 0, width, height },
    view: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
  }
}
