import { AbstractAction } from '.'
import { PhotoFlexContext } from '../../photo-flex-context'

export class ActionMove extends AbstractAction {
  constructor(private readonly _ctx: PhotoFlexContext) {
    super({ id: 'action:move', label: 'Move' })
  }
  run(): void {
    this._ctx.op.hello()
  }
}
