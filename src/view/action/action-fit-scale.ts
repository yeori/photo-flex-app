import { AbstractAction } from '.'
import type { PhotoFlexContext } from '../../photo-flex-context'

export class ActionFitCover extends AbstractAction {
  constructor(
    private readonly _ctx: PhotoFlexContext,
    private readonly scale: 'cover' | 'contain'
  ) {
    super({
      id: `action:fit-${scale}`,
      label: scale.charAt(0).toUpperCase() + scale.substring(1),
    })
  }
  run(): void {
    if (this.scale === 'contain') {
      this._ctx.op.fitByContain()
    } else if (this.scale === 'cover') {
      this._ctx.op.fitByCover()
    } else {
      throw new Error('check scaleMode: ' + this.scale)
    }
  }
}
