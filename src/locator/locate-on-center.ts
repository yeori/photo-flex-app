import { ImageLocator } from '.'

/**
 * locates subject on center of viewport
 * @param subject
 * @param center - center of viewport
 * @param ratio
 * @returns
 */
export const locateOnCenter: ImageLocator = (subject, center, ratio) => {
  const { width, height } = subject
  const SW = width * ratio
  const SH = height * ratio
  const { x, y } = center
  const dx = x - SW / 2
  const dy = y - SH / 2
  return {
    x: dx,
    y: dy,
    width: SW,
    height: SH,
  }
}
