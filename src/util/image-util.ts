export class ImageUtil {
  /**
   * infer real image size from dataUrl string
   * @param dataURL dataurl string for image data
   * @returns
   */
  inferSize(dataURL: string): number {
    if (
      !dataURL ||
      !dataURL.startsWith('data:') ||
      dataURL.indexOf(';base64,') === -1
    ) {
      console.warn('invalid dataURL string: see ', dataURL.substring(0, 300))
      return -1
    }

    const base64Marker = ';base64,'
    const pos = dataURL.indexOf(base64Marker)
    if (pos === -1) {
      console.warn('invalid dataURL string: see ', dataURL.substring(0, 300))
      return -1
    }

    const base64 = dataURL.substring(pos + base64Marker.length)
    const { length } = base64
    if (length === 0) {
      return 0
    }

    let padding = 0
    if (base64.endsWith('==')) {
      padding = 2
    } else if (base64.endsWith('=')) {
      padding = 1
    }
    const estimatedSize = (length * 3) / 4 - padding
    return Math.floor(estimatedSize)
  }
}
