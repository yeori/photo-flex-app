import { IAction } from '../../types'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionDefinition, ActionResizeParam } from '../../types'
import { dom } from '../../util'
import { ActionFitCover } from './action-fit-scale'
import { ActionMove } from './action-move'
import { ResizeAction } from './action-resize'
import { ZoomAction } from './action-zoom'
import { OpenAction } from './action-open'

export class ActionFactory {
  private _el: HTMLElement
  private _defaultActions: Map<string, IAction> = new Map()
  private _actions: IAction[] = []
  constructor(container: HTMLElement, private readonly _ctx: PhotoFlexContext) {
    this._el = dom.create(
      `div${this._ctx.resolveDataName('toolbar')}`,
      container
    )
    this._installDefaultActions()
  }
  private _addToMap(action: IAction) {
    this._defaultActions.set(action.id, action)
  }
  private _installDefaultActions() {
    this._addToMap(new OpenAction(this._ctx))
    this._addToMap(new ActionMove(this._ctx))
    this._addToMap(new ResizeAction(this._ctx))
    this._addToMap(new ZoomAction(this._ctx))
    this._addToMap(new ActionFitCover(this._ctx, 'cover'))
    this._addToMap(new ActionFitCover(this._ctx, 'contain'))
    this._addToMap(new ActionFitCover(this._ctx, 'real'))
  }
  installActions(params: ActionDefinition[]) {
    params.forEach((param) => {
      if (typeof param === 'string') {
        const id = `${param}`
        const action = this._defaultActions.get(id)
        if (action) {
          this.installAction(action)
        } else {
          throw new Error(`no such action(${id})`, {
            cause: 'ACTION_ID_NOT_FOUND',
          })
        }
      } else if (param.id === 'resize') {
        const { options } = param as ActionResizeParam
        const action = new ResizeAction(this._ctx, options)
        this.installAction(action)
      }
    })
  }
  installAction(action: IAction) {
    action.bindTo(this._el)
    this._actions.push(action)
  }
  dispose() {
    this._actions.forEach((action) => {
      action.dispose?.()
    })
  }
}
