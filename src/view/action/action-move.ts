import { AbstractAction } from '.'
import type { PhotoFlexContext } from '../../photo-flex-context'

export class ActionMove extends AbstractAction {
  constructor(_ctx: PhotoFlexContext) {
    super({ id: 'move', label: 'Move' }, _ctx)
  }
  run(): void {
    console.log('hello')
  }
}
