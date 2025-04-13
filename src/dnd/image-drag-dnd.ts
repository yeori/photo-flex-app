import { DragEvent, DragListener } from '.'
import { PhotoFlex } from '../photo-flex'
import { type Area } from '../scale'

export class ImageDragger implements DragListener {
  private _areas: Area[] = []
  constructor(readonly editor: PhotoFlex) {}
  before(): void {
    const { editor } = this
    this._areas = editor.layers.map((layer) =>
      Object.assign({}, layer.renderingSpec)
    )
  }
  dragging(e: DragEvent): void {
    const { editor } = this
    const { dx, dy } = e
    editor.layers.forEach((layer, index) => {
      layer.setPosition(this._areas[index].x + dx, this._areas[index].y + dy)
    })
    editor.repaint()
  }
  end(): void {
    this._areas = []
  }
}
