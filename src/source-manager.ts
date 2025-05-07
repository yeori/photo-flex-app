import { ImageSource } from './image-source'
import { SourceEvent } from './event'
import { PhotoFlexContext } from './photo-flex-context'
import { ImageCacheParam } from './scale'

/**
 * Manages a collection of ImageSource objects, typically from dropped files.
 * Allows selecting an image source to be used by other components like CanvasRenderer.
 */
export class SourceManager {
  private readonly sources: ImageSource[] = []
  private activeSource: ImageSource | null = null
  private _cachedMap: Map<string, ImageCacheParam> = new Map()

  constructor(private readonly _ctx: PhotoFlexContext) {}

  /**
   * Adds image sources to the manager.
   * @param sources image sources to add
   */
  public addSources(sources: ImageSource[], files: File[]): void {
    this.sources.push(...sources)
    this._emitEvent({
      type: 'added',
      sources: [...sources],
      files: files,
    })
  }

  /**
   * Removes an ImageSource from the manager by its name.
   * Also destroys the ImageSource to release its resources (e.g., ImageBitmap).
   * @param uuid The name of the ImageSource to remove.
   */
  public removeSource(uuid: string): void {
    const index = this.sources.findIndex((s) => s.uuid === uuid)
    if (index !== -1) {
      const removedSource = this.sources.splice(index, 1)[0]
      if (this.activeSource === removedSource) {
        this.clearActiveSource()
      }
      removedSource.destroy()
      this._emitEvent({ type: 'deleted', sources: [removedSource] })
    }
  }

  /**
   * Gets an ImageSource by its name.
   * @param name The name of the ImageSource.
   * @returns The ImageSource if found, otherwise undefined.
   */
  public getSourceByName(name: string): ImageSource | undefined {
    return this.sources.find((s) => s.uuid === name)
  }

  /**
   * Gets all ImageSource objects currently managed.
   * @returns An array of ImageSource objects.
   */
  public getSources(): ImageSource[] {
    return [...this.sources]
  }
  public write(param: ImageCacheParam) {
    this._cachedMap.set(param.imageUuid, param)
  }
  public read(uuid: string): ImageCacheParam | undefined {
    return this._cachedMap.get(uuid)
  }
  /**
   * Sets a specific ImageSource as the active one.
   * The active source is typically the one rendered on the canvas.
   * @param source The ImageSource to set as active, or its name.
   * @returns True if the source was found and set as active, false otherwise.
   */
  public setActiveSource(
    sourceOrName: ImageSource | string
  ): ImageCacheParam | undefined {
    const uuid =
      typeof sourceOrName === 'string' ? sourceOrName : sourceOrName.uuid
    const sourceToActivate = this.sources.find((s) => s.uuid === uuid)
    if (sourceToActivate) {
      this.activeSource = sourceToActivate

      return this._cachedMap.get(this.activeSource.uuid)
    } else {
      console.warn(
        `SourceManager: Could not set active source - ${
          typeof sourceOrName === 'string'
            ? sourceOrName
            : 'provided source not found'
        }.`
      )
    }
  }

  /**
   * Gets the currently active ImageSource.
   * @returns The active ImageSource or null if none is active.
   */
  public getActiveSource(): ImageSource | null {
    return this.activeSource
  }

  /**
   * Clears the currently active ImageSource.
   */
  public clearActiveSource(): void {
    if (this.activeSource) {
      console.log(
        `SourceManager: Cleared active source - ${this.activeSource.uuid}`
      )
      const previouslyActive = this.activeSource
      this.activeSource = null
      this._emitEvent({
        type: 'deactivated',
        sources: [previouslyActive],
      })
    }
  }

  /**
   * Clears all managed ImageSources and the active source.
   * Destroys each ImageSource to release its resources.
   */
  public clearAllSources(): void {
    this.sources.forEach((source) => source.destroy())
    const sources = this.sources.splice(0, this.sources.length)
    this.activeSource = null
    this._emitEvent({
      type: 'deleted',
      sources,
    })
  }

  /**
   * Helper to emit events if an eventBus is configured.
   */
  private _emitEvent(e: SourceEvent): void {
    this._ctx.eventBus.emit('source', e)
  }

  /**
   * Optional: Dispose method to clear all sources when the manager is no longer needed.
   */
  public dispose(): void {
    this.clearAllSources()
  }
}
