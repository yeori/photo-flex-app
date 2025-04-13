import { Viewport } from './scale'

export class ImageSource implements Viewport {
  // private _spec: Viewport
  private _map: ImageBitmap | undefined
  constructor(
    _map: ImageBitmap,
    readonly meta: { name: string; size: number; type: string }
  ) {
    this._map = _map
    //@ts-ignore
    this._spec = {
      width: _map.width,
      height: _map.height,
    }
  }
  get bitmap() {
    return this._map!
  }
  get x(): number {
    return 0
  }
  get y(): number {
    return 0
  }
  get width(): number {
    return this._map ? this._map.width : 0
  }
  get height(): number {
    return this._map ? this._map.height : 0
  }
  /**
   * File name
   */
  get name(): string {
    return this.meta.name
  }
  /**
   * File size in bytes
   */
  get fileSize(): number {
    return this.meta.size
  }
  get type(): string {
    return this.meta.type
  }
  // get renderingSpec(): RenderingSpec {
  //   return this._spec
  // }
  // setRenderingSpec(spec: RenderingSpec) {
  //   this._spec = spec
  // }
  // setLocation(x: number, y: number) {
  //   const { _spec } = this
  //   if (!_spec) {
  //     throw new Error('not initialized', { cause: 'NOT_INITIALIZED' })
  //   }
  //   _spec.view.x = x
  //   _spec.view.y = y
  // }
  // draw(ctx: CanvasRenderingContext2D) {
  //   const { bitmap, _spec: spec } = this
  //   const { subject: s, view: v } = spec
  //   ctx.drawImage(
  //     bitmap,
  //     s.x,
  //     s.y,
  //     s.width,
  //     s.height,
  //     v.x,
  //     v.y,
  //     v.width,
  //     v.height
  //   )
  // }
  destroy(): void {
    if (this._map) {
      this._map.close()
      this._map = undefined
    }
  }
  static async fromFile(file: File) {
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image')
    }
    const bitmap = await createImageBitmap(file)
    const { name, size, type } = file
    return new ImageSource(bitmap, { name, size, type })
  }
}
