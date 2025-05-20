import { PhotoflexSizeParam } from './types'
import { dom } from './util'

export const bindDimension = (
  el: HTMLElement,
  target: 'width' | 'height',
  value: 'fluid' | string | PhotoflexSizeParam,
  scale: number = 1
): void => {
  let val: [number, string]
  if (value === 'fluid') {
    val = [100, '%']
  } else if (typeof value === 'string') {
    val = dom.parseUnit(value)
  } else {
    val = dom.parseUnit(value.value)
  }

  if (target === 'width') {
    el.style.maxWidth = `${val[0] * scale}${val[1]}`
  } else if (target === 'height') {
    el.style.maxHeight = `${val[0] * scale}${val[1]}`
  }

  el.style[target] = '100%'
}
