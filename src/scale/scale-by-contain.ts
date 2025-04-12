import { RenderingSpec, Viewport } from '.'
/**
 * scale subject to fit viewport
 * @param src subject to be rendered on viewport
 * @param viewport viewport to render subject
 * @returns
 */
export const scaleByContain = (
  src: Viewport,
  viewport: Viewport
): RenderingSpec => {
  const { width: subjectWidth, height: subjectHeight } = src
  const { width: viewWidth, height: viewHeight } = viewport
  const ratio = Math.min(viewWidth / subjectWidth, viewHeight / subjectHeight)
  const dw = subjectWidth * ratio
  const dh = subjectHeight * ratio
  const dx = (viewWidth - dw) / 2
  const dy = (viewHeight - dh) / 2
  return {
    subject: { x: 0, y: 0, width: subjectWidth, height: subjectHeight },
    view: {
      x: dx,
      y: dy,
      width: dw,
      height: dh,
    },
    ratio,
  }
}
