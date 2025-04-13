import { Viewport } from '.'
/**
 * ratio to fit viewport
 * @param src subject to be rendered on viewport
 * @param viewport viewport to render subject
 * @returns
 */
export const scaleByContain = (src: Viewport, viewport: Viewport): number => {
  const { width, height } = src
  const { width: viewWidth, height: viewHeight } = viewport
  return Math.min(viewWidth / width, viewHeight / height)
}
