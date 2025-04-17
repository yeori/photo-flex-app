import { DragEvent, DragListener } from '.'
import { PhotoFlex } from '../photo-flex'
import { type Point } from '../scale'

export class ImageDragger implements DragListener {
  private _origins: Point[] = []
  constructor(readonly editor: PhotoFlex) {}
  before(): void {
    this._origins = this.editor.getLayerOrigins()
  }
  dragging(e: DragEvent): void {
    const { editor } = this
    const { dx, dy } = e
    editor.getLayers().forEach((_, index) => {
      editor.setLayerOrigin(
        index,
        this._origins[index].x + dx,
        this._origins[index].y + dy
      )
    })
    editor.repaint()
  }
  end(): void {
    this._origins = []
  }
}
