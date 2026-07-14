import { type ImageSource } from '../image-source'
import { mergeParam } from '../merge-param'
import { type Viewport } from '../scale'
import {
  ActionDefinition,
  ActionNameList,
  ActionParam,
  ActionResizeParam,
  ActionZoomParam,
  PhotoFlexInitParam,
  ActionIconRender,
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
const iconMap: Record<ActionNameList, string> = {
  file: 'folder_open',
  camera: 'photo_camera',
  resize: 'aspect_ratio',
  'fit-cover': 'fullscreen',
  'fit-contain': 'fit_screen',
  'fit-real': 'view_real_size',
  zoom: '',
  capture: 'capture',
}
/**
 * default action decorator.
 * @param actionId
 * @param el
 */
const decorateAction = (actionId: string, el: HTMLElement, customIcon?: string | ActionIconRender) => {
  const icon = customIcon !== undefined ? customIcon : iconMap[actionId as ActionNameList]
  if (icon) {
    if (typeof icon === 'function') {
      const rendered = icon(actionId, 'photoflex-icon')
      if (rendered instanceof HTMLElement) {
        el.appendChild(rendered)
      } else {
        const trimmed = rendered.trim()
        if (trimmed.startsWith('<')) {
          dom.createFromHtml(trimmed, el)
        } else {
          renderStringIcon(actionId, el, trimmed)
        }
      }
    } else {
      renderStringIcon(actionId, el, icon)
    }
  }
}

const renderStringIcon = (actionId: string, el: HTMLElement, pathOrSymbol: string) => {
  let trimmed = pathOrSymbol.trim()
  if (trimmed.startsWith('url(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(4, -1).trim()
    if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
      trimmed = inner.slice(1, -1).trim()
    } else {
      trimmed = inner
    }
  }

  if (trimmed.includes('/') || trimmed.includes('.') || trimmed.startsWith('data:')) {
    dom.createFromHtml(`<img class="photoflex-icon" src="${trimmed}" alt="${actionId}" />`, el)
  } else {
    dom.createFromHtml(
      `<span class="material-symbols-outlined">${trimmed}</span>`,
      el
    )
  }
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
  views: [
    { name: 'image-source-view', use: true },
    { name: 'after-image-view', use: true },
  ],
  classnames: {
    prefix: 'photoflex',
    board: 'board',
    root: 'root',
    canvas: 'canvas',
    toolbar: 'toolbar',
  },
  handler: { name: (image) => `${image.name}`, action: decorateAction },
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
  get views() {
    return this._param.views || DefaultInit.views
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
   * @param actionId action id
   */
  getDefaultActionParam(actionId: string): ActionParam {
    const param = DefaultActionParams[actionId]
    if (!param) {
      throw new Error(`Unknown default action id: ${actionId}`)
    }
    return dom.deepClone(param)
  }
  resolveScale(scale: number): number {
    const { min, max } = this.getOptionForZoomAction()
    let val = Math.max(min, scale)
    val = Math.min(max, val)
    return val
  }
  resolveFileName(image: ImageSource, viewport: Viewport) {
    const nameHandler = this._param.handler?.name || DefaultInit.handler.name!
    return nameHandler(image, viewport)
  }
  bindTooltip(el: HTMLElement, param: ActionParam) {
    el.dataset.photoflexTooltip = param.tooltip || param.label
  }
  decorateAction<K extends HTMLElement>(type: string, labelEl: K, customIcon?: string | ActionIconRender) {
    this._param.handler!.action!(type, labelEl, customIcon)
  }
}
