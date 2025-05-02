import { PhotoflexSizeParam } from './types'

export const bindDimension = (
  el: HTMLElement,
  target: 'width' | 'height',
  value: 'fluid' | string | PhotoflexSizeParam
): void => {
  let val = ''
  if (value === 'fluid') {
    val = '100%'
  } else if (typeof value === 'string') {
    val = value
  } else {
    val = value.value
  }

  el.style[target] = val
}
