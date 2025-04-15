import { PhotoFlexInitParam } from '.'
import { IPhotoFlexOp } from './photo-flex-operation'
import { Viewport } from './scale'
import { dom } from './util'

export class PhotoFlexContext {
  constructor(
    private readonly _op: IPhotoFlexOp,
    private readonly _param: PhotoFlexInitParam,
    private readonly _default: Required<PhotoFlexInitParam>
  ) {}
  get op(): IPhotoFlexOp {
    return this._op
  }
  get param(): PhotoFlexInitParam {
    return this._param
  }
  get wheelSensitivity() {
    return this._param.wheelSensitivity || this._default.wheelSensitivity
  }
  get viewportSize(): Viewport {
    const w = this._param?.width || this._default.width!
    const h = this._param?.height || this._default.height!
    const [width] = dom.parseUnit(w)
    const [height] = dom.parseUnit(h)
    return { width, height }
  }
}
