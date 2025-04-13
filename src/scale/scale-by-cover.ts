import { Viewport } from '.'
/**
 * ratio to cover viewport
 * @param subject
 * @param viewport
 * @returns
 */
export const scaleByCover = (subject: Viewport, viewport: Viewport): number => {
  const { width: subjectWidth, height: subjectHeight } = subject
  const { width: viewWidth, height: viewHeight } = viewport
  return Math.max(viewWidth / subjectWidth, viewHeight / subjectHeight)
}
