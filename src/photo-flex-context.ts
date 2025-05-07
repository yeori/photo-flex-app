import type { DataNameParam, PhotoFlexInitParam } from './types'
import type { EventBus, PhotoFlexEvent, Unsubscriber } from './event'
import type { IPhotoFlexOp } from './photo-flex-operation'
import type { Viewport } from './scale'
import { type ParameterContext } from './view/param-context'
import { type PhotoFlexEventMap } from './event/event-bus'
import { type ImageSource } from './image-source'
import { type PhotoFlex } from './photo-flex'

export class PhotoFlexContext {
  constructor(
    private readonly _flex: PhotoFlex,
    private readonly _op: IPhotoFlexOp,
    private readonly _paramContext: ParameterContext
  ) {}
  get op(): IPhotoFlexOp {
    return this._op
  }
  get param(): PhotoFlexInitParam {
    return this._paramContext.parameter
  }
  get wheelSensitivity() {
    return this._paramContext.wheelSensitivity
  }
  get viewportSize(): Viewport {
    return this.op.viewportSize
  }
  get eventBus(): EventBus {
    return this._op.eventBus
  }
  get paramContext(): ParameterContext {
    return this._paramContext
  }
  setActiveImage(source: ImageSource) {
    this._flex.setActiveImage(source)
  }
  resolveDataName(viewType: keyof DataNameParam) {
    const { parameter } = this._paramContext
    const { prefix } = parameter.classnames!
    const val = parameter.classnames![viewType]
    return `[data-${prefix}-${val}]`
  }
  subscribe<K extends PhotoFlexEvent>(
    event: K,
    handler: (payload: PhotoFlexEventMap[K]) => void
  ): Unsubscriber {
    return this.eventBus.subscribe(event, handler)
  }
}
