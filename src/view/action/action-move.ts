import { AbstractAction } from '.'
import { IPhotoFlexOp } from '../../photo-flex-operation'

export class ActionMove extends AbstractAction {
  constructor(private readonly op: IPhotoFlexOp) {
    super({ id: 'action:move', label: 'Move' })
  }
  run(): void {
    this.op.hello()
  }
}
