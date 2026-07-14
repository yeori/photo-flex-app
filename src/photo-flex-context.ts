import type { DataNameParam, PhotoFlexInitParam, ActionIconRender } from './types'
import type { EventBus, PhotoFlexEvent, Unsubscriber } from './event'
import type { IPhotoFlexOp } from './photo-flex-operation'
import type { Viewport } from './scale'
import { type ParameterContext } from './view/param-context'
import { type PhotoFlexEventMap } from './event/event-bus'
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
  decorateAction<K extends HTMLElement>(type: string, labelEl: K, customIcon?: string | ActionIconRender) {
    this._paramContext.decorateAction(type, labelEl, customIcon)
  }
  getFlex() {
    return this._flex
  }
  setActiveImage(imageUuid: string) {
    this._flex.setActiveImage(imageUuid)
  }
  private _viewportSizeOf(
    value: string,
    target: 'width' | 'height'
  ): [number, string] {
    if (value === 'fluid') {
      return [this._flex[target], 'px']
    } else {
      return this._paramContext.getMeasuredSizeAt(target)
    }
  }
  getViewportSize() {
    const { width: paramW, height: paramH } = this._paramContext.size

    const width = this._viewportSizeOf(paramW, 'width')
    const height = this._viewportSizeOf(paramH, 'height')

    return { width, height }
  }
  getVewportScale() {
    return this._flex.viewportScale
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
  openImageSourceView() {
    this._flex.openImageSourceView()
  }
}
