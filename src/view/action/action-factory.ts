import { IAction } from '.'
import { ActionDefinition } from '../..'
import { PhotoFlexContext } from '../../photo-flex-context'
import { dom } from '../../util'
import { ActionMove } from './action-move'
import { ResizeAction } from './action-resize'
import { ZoomAction } from './action-zoom'

export class ActionFactory {
  private _el: HTMLElement
  private _defaultActions: Map<string, IAction> = new Map()
  private _actions: IAction[] = []
  constructor(container: HTMLElement, private readonly _ctx: PhotoFlexContext) {
    const { prefix, toolbar: control } = this._ctx.param.classnames!
    this._el = dom.create(`div[data-${prefix}${control}]`, container)
    this._installDefaultActions()
  }
  private _addToMap(action: IAction) {
    this._defaultActions.set(action.id, action)
  }
  private _installDefaultActions() {
    this._addToMap(new ActionMove(this._ctx))
    this._addToMap(new ResizeAction(this._ctx))
    this._addToMap(new ZoomAction(this._ctx))
  }
  installActions(params: ActionDefinition[]) {
    params.forEach((param) => {
      if (typeof param === 'string') {
        const id = `action:${param}`
        const action = this._defaultActions.get(id)
        if (action) {
          this.installAction(action)
        } else {
          throw new Error(`no such action(${id})`, {
            cause: 'ACTION_ID_NOT_FOUND',
          })
        }
      } else {
        console.log('[action]', param)
      }
    })
  }
  installAction(action: IAction) {
    action.bindTo(this._el)
    this._actions.push(action)
  }
}
