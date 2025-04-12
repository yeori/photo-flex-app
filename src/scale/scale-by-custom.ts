import { RenderingSpec, Viewport } from '.'

/**
 * No scale. Just calculate a area of the image
 * @param src
 * @param viewport
 * @returns
 */
export const scaleByCustom = (
  src: Viewport,
  viewport: Viewport
): RenderingSpec => {
  const { width, height } = src
  const { width: viewWidth, height: viewHeight } = viewport
  const dx = (viewWidth - width) / 2
  const dy = (viewHeight - height) / 2
  return {
    subject: { x: 0, y: 0, width, height },
    view: {
      x: dx,
      y: dy,
      width,
      height,
    },
    ratio: 1,
  }
}
