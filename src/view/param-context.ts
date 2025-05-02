import { mergeParam } from '../merge-param'
import { ActionDefinition, PhotoFlexInitParam } from '../types'

const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  zoom: 'contain',
  wheelSensitivity: 0.002,
  actions: [
    'open',
    {
      id: 'resize',
      label: 'Resize',
      options: [
        { width: 320, height: 320 },
        { width: 480, height: 480 },
        { width: 640, height: 640 },
      ],
    },
    'fit-cover',
    'fit-contain',
    'fit-real',
    'zoom',
  ],
  classnames: {
    prefix: 'photoflex',
    board: 'board',
    root: 'root',
    canvas: 'canvas',
    toolbar: 'toolbar',
  },
  loadContext: (canvas) => canvas.getContext('2d')!,
}

export class ParameterContext {
  private readonly _param: PhotoFlexInitParam
  constructor(param?: PhotoFlexInitParam) {
    this._param = mergeParam(DefaultInit, param)
  }
  get actions(): ActionDefinition[] {
    return this._param.actions || []
  }
  get parameter() {
    return this._param
  }
  get wheelSensitivity() {
    return this._param.wheelSensitivity!
  }
  get classnames() {
    return { ...this._param.classnames! }
  }
  get scaleMode() {
    return this._param.zoom
  }
  get size() {
    const { width, height } = this._param
    return { width: width!, height: height! }
  }
  get ratio(): number {
    const zoom = this._param.zoom!
    if (zoom === 'cover' || zoom === 'contain') {
      throw new Error('zoom mode is not supported')
    } else {
      return zoom
    }
  }
  private _setSizeAt(target: 'width' | 'height', value: number) {
    const elem = this._param[target]!
    if (typeof elem === 'string') {
      this._param[target] = `${value}px`
    } else {
      elem.value = `${value}px`
    }
  }
  setSize(width: number, height: number) {
    this._setSizeAt('width', width)
    this._setSizeAt('height', height)
  }
  private _sizeOf(target: 'width' | 'height') {
    const elem = this._param[target]!
    if (typeof elem === 'string') {
      return elem
    }
    return elem.value
  }
  /**
   * width value including metric like "100%", "430px" etc
   * @returns
   */
  getWidth() {
    return this._sizeOf('width')
  }
  getHeight() {
    return this._sizeOf('height')
  }
  isResizable(target: 'width' | 'height') {
    const elem = this._param[target]!
    if (typeof elem === 'string') {
      return false
    }
    return !!elem.resizable
  }
}
