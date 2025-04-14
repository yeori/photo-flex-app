import { DragEvent, DragListener } from '.'
import { PhotoFlex } from '../photo-flex'
import { type Point } from '../scale'

export class ImageDragger implements DragListener {
  private _origins: Point[] = []
  constructor(readonly editor: PhotoFlex) {}
  before(): void {
    const { editor } = this
    this._origins = editor.layers.map((layer) =>
      Object.assign({}, layer.getOrigin())
    )
  }
  dragging(e: DragEvent): void {
    const { editor } = this
    const { dx, dy } = e
    editor.layers.forEach((layer, index) => {
      layer.setOrigin(this._origins[index].x + dx, this._origins[index].y + dy)
    })
    editor.repaint()
  }
  end(): void {
    this._origins = []
  }
}
