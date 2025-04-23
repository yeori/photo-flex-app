import { PinchEvent, PinchListener } from '.'
import { PhotoFlex } from '../photo-flex'

/**
 * It handles canvas zooming via pinch gestures.
 */
export class ZoomByPinch implements PinchListener {
  private initialRatio: number = -1
  constructor(readonly editor: PhotoFlex) {}
  before(): void {
    if (this.initialRatio === -1) {
      this.initialRatio = this.editor.getZoomLevel()
    }
  }

  zooming(e: PinchEvent): void {
    this.before() // in case of `drag` => `zoom` by second touch
    const newRatio = this.initialRatio * e.scale
    this.editor.setZoom(newRatio)
    this.editor.repaint()
  }

  end(): void {
    this.initialRatio = -1
  }
}
