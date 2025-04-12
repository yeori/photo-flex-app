import { AbstractAction } from '.'

export class ActionMove extends AbstractAction {
  constructor() {
    super({ id: 'action:move', label: 'Move' })
  }
  run(): void {
    console.log('action: move')
  }
}
