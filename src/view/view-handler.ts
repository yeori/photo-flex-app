import { IView, ViewName } from '.'
import { type PhotoFlexContext } from '../photo-flex-context'
import { AfterImageView } from './after-image-view'
import { ImageSourceView } from './image-source-view'
import { TooltipView } from './tooltip/tooltip-view'
import { CaptureEffectView } from './capture-effect-view'

export class ViewHandler {
  private readonly _views: IView[] = []
  constructor(private readonly _ctx: PhotoFlexContext) {}
  installView(boardEl: HTMLElement, rootEl: HTMLElement) {
    const { views } = this._ctx.paramContext
    views
      .filter((view) => view.use !== false)
      .forEach((param) => {
        let view: IView | undefined = undefined
        switch (param.name) {
          case 'after-image-view':
            view = new AfterImageView(this._ctx)
            view.bindTo(boardEl)
            break
          case 'image-source-view':
            view = new ImageSourceView(this._ctx)
            view.bindTo(rootEl)
            break
          case 'capture-effect-view':
            view = new CaptureEffectView(this._ctx)
            view.bindTo(boardEl)
            break
          default:
            throw new Error(
              `invalid view. check name: ${JSON.stringify(param)}`
            )
        }
        if (view) {
          this._views.push(view)
        }
      })
    if (!this.isUsing('tooltip-view')) {
      const tooltipView = new TooltipView(this._ctx)
      tooltipView.bindTo(rootEl)
      this._views.push(tooltipView)
    }
  }
  getView<T extends IView>(name: ViewName): T {
    const view = this._views.find((view) => view.name === name)
    if (!view) {
      throw new Error(`view not found. name: ${name}`)
    }
    return view as T
  }
  isUsing(name: ViewName): boolean {
    return !!this._views.find((view) => view.name === name)
  }
}
