import { mergeParam } from '../merge-param'
import { Viewport } from '../scale'
import {
  ActionDefinition,
  ActionParam,
  ActionResizeParam,
  ActionZoomParam,
  PhotoFlexInitParam,
} from '../types'
import { dom } from '../util'

const DefaultActionParams: Record<string, ActionParam> = {
  file: { id: 'file', label: 'Image', tooltip: 'Open image file(s)' },
  camera: {
    id: 'camera',
    label: 'Camera',
    tooltip: 'Take a photo',
  },
  resize: {
    id: 'resize',
    label: 'Resize',
    options: [
      { width: 320, height: 320 },
      { width: 480, height: 480 },
      { width: 640, height: 640 },
    ],
  } as ActionResizeParam,
  'fit-cover': {
    id: 'fit-cover',
    label: 'Cover',
    tooltip: 'Cover viewport',
  },
  'fit-contain': {
    id: 'fit-contain',
    label: 'Fit Contain',
    tooltip: 'Fit within viewport',
  },
  'fit-real': {
    id: 'fit-real',
    label: 'Actual Size',
    tooltip: '100% size',
  },
  zoom: { id: 'zoom', label: 'Zoom', tooltip: 'Adjust zoom level' },
  capture: {
    id: 'capture',
    label: 'Capture',
    tooltip: 'Capture Viewport',
  },
}

const DefaultInit: Required<PhotoFlexInitParam> = {
  width: '400px',
  height: '400px',
  scale: 'contain',
  wheelSensitivity: 0.002,
  actions: [
    DefaultActionParams.file,
    DefaultActionParams.camera,
    DefaultActionParams.resize,
    DefaultActionParams['fit-cover'],
    DefaultActionParams['fit-contain'],
    DefaultActionParams['fit-real'],
    DefaultActionParams.zoom,
    DefaultActionParams.capture,
  ],
  renderers: [],
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
  get renderers() {
    return this._param.renderers || DefaultInit.renderers
  }
  get ratio(): number {
    const scale = this._param.scale!
    if (scale === 'cover' || scale === 'contain') {
      throw new Error('zoom mode is not supported')
    } else {
      return scale
    }
  }
  get defaultResizeParam(): ActionResizeParam {
    const action = DefaultInit.actions.find(
      (action) =>
        typeof action !== 'string' && 'id' in action && action.id === 'resize'
    )
    if (!action) {
      throw new Error('no DefaultResizeParam found')
    }
    return action as ActionResizeParam
  }
  private _setSizeAt(target: 'width' | 'height', value: number) {
    const elem = this._param[target]!
    if (elem === 'fluid') {
      this._param[target] = elem
    } else if (typeof elem === 'string') {
      this._param[target] = `${value}px`
    } else {
      throw new Error(`invalid size. ${target}: ${elem}`)
    }
  }
  setSize(width: number, height: number) {
    this._setSizeAt('width', width)
    this._setSizeAt('height', height)
  }
  getMeasuredSizeAt(target: 'width' | 'height'): [number, string] {
    const elem = this._param[target]!
    let expression: string = ''
    if (elem === 'fluid') {
      expression = '100%'
    } else if (typeof elem === 'string') {
      expression = elem
    } else {
      throw new Error(`invalid size. ${target}: ${elem}`)
    }
    return dom.parseUnit(expression)
  }
  /**
   * width value including metric like "100%", "430px" etc
   * @returns
   */
  getWidth(): [number, string] {
    return this.getMeasuredSizeAt('width')
  }
  getHeight(): [number, string] {
    return this.getMeasuredSizeAt('height')
  }
  isResizable(target: 'width' | 'height') {
    const elem = this._param[target]!
    return elem === 'fluid'
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
      } else if (typeof action === 'function') {
        return false
      } else return action.id === 'zoom'
    })
    if (!zoom || typeof zoom === 'string') {
      return DefaultZoomActionOption
    } else {
      return (zoom as ActionZoomParam).options?.[0] || DefaultZoomActionOption
    }
  }
  /**
   * find default action for the action id
   * @param defintion action id
   */
  getDefaultAction(defintion: ActionDefinition): ActionParam {
    if (typeof defintion === 'string') {
      const defaultParam = DefaultActionParams[defintion]
      if (!defaultParam) {
        throw new Error(`Unknown default action id: ${defintion}`)
      }
      return { ...defaultParam } // Return a copy
    } else if ('id' in defintion && typeof defintion.id === 'string') {
      const defaultParam = DefaultActionParams[defintion.id]
      if (defaultParam) {
        return { ...defaultParam, ...defintion }
      }
      return { ...defintion }
    } else {
      throw new Error(`Invalid action definition type: ${typeof defintion}`)
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

  bindTooltip(el: HTMLElement, param: ActionParam) {
    el.dataset.photoflexTooltip = param.tooltip || param.label
  }
}
