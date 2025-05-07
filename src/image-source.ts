import { Viewport } from './scale'
import { dom } from './util'

export class ImageSource implements Viewport {
  private _map: ImageBitmap | undefined
  private _uuid: string
  constructor(
    _map: ImageBitmap,
    readonly meta: { name: string; size: number; type: string }
  ) {
    this._map = _map
    this._uuid = dom.randomKey()
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
  get uuid() {
    return this._uuid
  }
  /**
   * File name
   */
  get name(): string {
    return this.meta.name
  }
  /**
   * mime type
   */
  get mimeType(): string {
    return this.meta.type
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
  equals(other: ImageSource) {
    return other && other.uuid === this.uuid
  }
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
  static fromSource(source: ImageSource) {
    return new ImageSource(source.bitmap, source.meta)
  }
}
