import type { DataNameParam, PhotoFlexInitParam } from './types'
import { EventBus } from './event'
import { IPhotoFlexOp } from './photo-flex-operation'
import { Viewport } from './scale'
import { type ParameterContext } from './view/param-context'

export class PhotoFlexContext {
  constructor(
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
  resolveDataName(viewType: keyof DataNameParam) {
    const { parameter } = this._paramContext
    const { prefix } = parameter.classnames!
    const val = parameter.classnames![viewType]
    return `[data-${prefix}-${val}]`
  }
}
