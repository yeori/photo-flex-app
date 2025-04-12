import { IAction } from '.'
import { ActionMove } from './action-move'

export class ActionFactory {
  private _actions: IAction[]
  constructor() {
    this._actions = []
  }
  installDefaultActions() {
    this._actions.push(new ActionMove())
  }
}
