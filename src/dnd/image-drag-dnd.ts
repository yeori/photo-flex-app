import { DragEvent, DragListener } from '.'
import { PhotoFlex } from '../photo-flex'
import { type Point } from '../scale'

export class ImageDragger implements DragListener {
  private _origins: Point[] = []
  constructor(readonly editor: PhotoFlex) {}
  before(): void {
    this._origins = this.editor.getLayerOrigins()
    this.editor.setCursor('grabbing')
  }
  dragging(e: DragEvent): void {
    const { editor } = this
    const { dx, dy } = e
    editor.getLayers().forEach((layer, index) => {
      editor.setLayerOffset(
        layer,
        this._origins[index].x + dx,
        this._origins[index].y + dy
      )
    })
    editor.repaint()
  }
  end(): void {
    this.editor.getLayers().forEach((layer) => {
      const offset = layer.getOffset()
      this.editor.setLayerOffset(layer, offset.x, offset.y, true)
    })
    this._origins = []
    this.editor.setCursor('grab')
  }
}
