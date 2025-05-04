import { mergeParam } from '../merge-param'
import { Viewport } from '../scale'
import { ActionDefinition, ActionZoomParam, PhotoFlexInitParam } from '../types'

const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  scale: 'contain',
  wheelSensitivity: 0.002,
  actions: [
    'file',
    'camera',
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
    'capture',
  ],
  classnames: {
    prefix: 'photoflex',
    board: 'board',
    root: 'root',
    canvas: 'canvas',
    toolbar: 'toolbar',
  },
  handler: { name: (name, ext) => `${name}${ext}` },
  loadContext: (canvas) => canvas.getContext('2d')!,
}

const DefaultZoomActionOption = {
  min: 0.1,
  max: 2,
  step: 0.1,
  value: 1,
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
    return this._param.scale
  }
  get size() {
    const { width, height } = this._param
    return { width: width!, height: height! }
  }
  get ratio(): number {
    const scale = this._param.scale!
    if (scale === 'cover' || scale === 'contain') {
      throw new Error('zoom mode is not supported')
    } else {
      return scale
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
    if (elem === 'fluid') {
      return true
    } else if (typeof elem === 'string') {
      return false
    }
    return !!elem.resizable
  }
  getOptionForZoomAction(): {
    min: number
    max: number
    step: number
    value: number
  } {
    const { actions } = this._param
    const zoom = actions!.find((action) => {
      if (typeof action === 'string') {
        return action === 'zoom'
      } else return action.id === 'zoom'
    })
    if (!zoom || typeof zoom === 'string') {
      return DefaultZoomActionOption
    } else {
      return (zoom as ActionZoomParam).options?.[0] || DefaultZoomActionOption
    }
  }
  resolveScale(scale: number): number {
    const { min, max } = this.getOptionForZoomAction()
    let val = Math.max(min, scale)
    val = Math.min(max, val)
    return val
  }
  private parseFileName(fileName: string) {
    let pos = fileName.lastIndexOf('.')
    if (pos < 0) {
      pos = fileName.length
    }
    const name = fileName.substring(0, pos)
    const ext = fileName.substring(pos)
    return { name, ext }
  }
  resolveFileName(fileName: string, viewport: Viewport) {
    const nameHandler = this._param.handler?.name || DefaultInit.handler.name!
    const { name, ext } = this.parseFileName(fileName)
    return nameHandler(name, ext, viewport)
  }
}
