import { ActionZoomParam, IAction } from '../../types'
import { PhotoFlexContext } from '../../photo-flex-context'
import { ActionDefinition, ActionResizeParam } from '../../types'
import { dom } from '../../util'
import { ActionFitCover } from './action-fit-scale'
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
    const { paramContext: pctx } = this._ctx
    this._addToMap(new OpenAction(this._ctx, pctx.getDefaultAction('file')))
    this._addToMap(new OpenAction(this._ctx, pctx.getDefaultAction('camera')))
    this._addToMap(
      new ResizeAction(
        this._ctx,
        pctx.getDefaultAction('resize') as ActionResizeParam
      )
    )
    this._addToMap(new ZoomAction(this._ctx, pctx.getDefaultAction('zoom')))
    this._addToMap(
      new ActionFitCover(this._ctx, 'cover', pctx.getDefaultAction('fit-cover'))
    )
    this._addToMap(
      new ActionFitCover(
        this._ctx,
        'contain',
        pctx.getDefaultAction('fit-contain')
      )
    )
    this._addToMap(
      new ActionFitCover(this._ctx, 'real', pctx.getDefaultAction('fit-real'))
    )
    this._addToMap(
      new CaptureAction(this._ctx, pctx.getDefaultAction('capture'))
    )
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
        const action = new ResizeAction(this._ctx, param as ActionResizeParam)
        this.installAction(action)
      } else if (param.id === 'zoom') {
        this.installAction(new ZoomAction(this._ctx, param as ActionZoomParam))
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
