import {
  type ActionConstructor,
  type ActionNameList,
  type IAction
} from '../../types'
import { type PhotoFlexContext } from '../../photo-flex-context'
import { type ActionDefinition } from '../../types'
import { dom } from '../../util'
import { ActionFit } from './action-fit-scale'
import { ZoomAction } from './action-zoom'
import { OpenAction } from './action-open'
import { CaptureAction } from './action-capture'
import { ResizeAction } from './action-resize'

export class ActionFactory {
  private _el: HTMLElement
  private _constructors: Map<ActionNameList, ActionConstructor> = new Map()
  private _actions: IAction[] = []
  constructor(
    container: HTMLElement,
    private readonly _ctx: PhotoFlexContext
  ) {
    this._el = dom.create(
      `div${this._ctx.resolveDataName('toolbar')}`,
      container
    )
    this._installDefaultActions()
  }
  private _installDefaultActions() {
    this._constructors.set('file', OpenAction)
    this._constructors.set('camera', OpenAction)
    this._constructors.set('resize', ResizeAction)
    this._constructors.set('capture', CaptureAction)
    this._constructors.set('fit-action', ActionFit)
    this._constructors.set('zoom', ZoomAction)
  }
  installActions(params: ActionDefinition[]) {
    params.forEach((param) => {
      if (typeof param === 'string') {
        const id = `${param}`
        const constructor = this._constructors.get(id as ActionNameList)
        if (constructor) {
          const { paramContext: pctx } = this._ctx
          const action = new constructor(
            this._ctx,
            pctx.getDefaultActionParam(id)
          )
          this.installAction(action)
        } else {
          console.warn(
            `[PHOTOFLEX-APP] ACTION_ID_NOT_FOUND: no such action name: ${id}`
          )
        }
      } else if (
        typeof param === 'object' &&
        'bindTo' in param &&
        typeof (param as any).bindTo === 'function'
      ) {
        this.installAction(param as IAction)
      } else if (typeof param === 'function') {
        if ('prototype' in param && typeof param.prototype === 'object') {
          this.installAction(new param(this._ctx))
        }
      } else if ('id' in param) {
        const constructor = this._constructors.get(param.id as ActionNameList)
        if (constructor) {
          const action = new constructor(this._ctx, param)
          this.installAction(action)
        } else {
          console.warn(
            `[PHOTOFLEX-APP] ACTION_ID_NOT_FOUND: no such action name: ${param.id}`
          )
        }
      }
    })
  }
  installAction(action: IAction) {
    if (action.setContext) {
      action.setContext(this._ctx)
    }
    action.bindTo(this._el)
    this._actions.push(action)
  }
  dispose() {
    this._actions.forEach((action) => {
      action.dispose?.()
    })
  }
}
