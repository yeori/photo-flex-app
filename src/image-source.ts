import { Viewport } from '.'

export class ImageSource implements Viewport {
  constructor(
    private _map: ImageBitmap | undefined,
    readonly meta: { name: string; size: number; type: string }
  ) {}
  get bitmap() {
    return this._map!
  }
  get width(): number {
    return this._map ? this._map.width : 0
  }
  get height(): number {
    return this._map ? this._map.height : 0
  }
  get name(): string {
    return this.meta.name
  }
  get size(): number {
    return this.meta.size
  }
  get type(): string {
    return this.meta.type
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
}
