import { AbstractAction } from '.'
import type { PhotoFlexContext } from '../../photo-flex-context'

export class ActionMove extends AbstractAction {
  constructor(_ctx: PhotoFlexContext) {
    super(_ctx, { id: 'move', label: 'Move' })
  }
  run(): void {
    console.log('hello')
  }
}
