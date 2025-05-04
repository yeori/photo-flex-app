import { IAction } from '../../types'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionDefinition, ActionResizeParam } from '../../types'
import { dom } from '../../util'
import { ActionFitCover } from './action-fit-scale'
import { ActionMove } from './action-move'
import { ResizeAction } from './action-resize'
import { ZoomAction } from './action-zoom'
import { OpenAction } from './action-open'
import { CaptureAction } from './action-capture'
import { AbstractAction } from '.'

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
    this._addToMap(new OpenAction(this._ctx, 'file'))
    this._addToMap(new OpenAction(this._ctx, 'camera'))
    this._addToMap(new ActionMove(this._ctx))
    this._addToMap(new ResizeAction(this._ctx))
    this._addToMap(new ZoomAction(this._ctx))
    this._addToMap(new ActionFitCover(this._ctx, 'cover'))
    this._addToMap(new ActionFitCover(this._ctx, 'contain'))
    this._addToMap(new ActionFitCover(this._ctx, 'real'))
    this._addToMap(new CaptureAction(this._ctx))
  }
  installActions(params: ActionDefinition[]) {
    params.forEach((param) => {
      if (typeof param === 'string') {
        const id = `${param}`
        const action = this._defaultActions.get(id)
        if (action) {
          this.installAction(action)
        } else {
          console.warn(
            `[PHOTOFLEX-APP] ACTION_ID_NOT_FOUND: no such action(${id})`
          )
        }
      } else if (param.id === 'resize') {
        const { options } = param as ActionResizeParam
        const action = new ResizeAction(this._ctx, options)
        this.installAction(action)
      } else if (param.id === 'zoom') {
        this.installAction(new ZoomAction(this._ctx))
      } else if (param instanceof AbstractAction) {
        param.setContext(this._ctx)
        this.installAction(param)
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
