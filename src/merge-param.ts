import { dom } from './util'
/**
 * merge user's param using base param.
 * @param base used to fill user's invalid param
 * @param user param defined by user
 */
export const mergeParam = <T extends {}>(base: T, user?: T): T => {
  if (!user) {
    return dom.deepClone(base)
  }
  if (dom.isPrimitve(base) || dom.isFunction(base)) {
    return user
  }
  Object.keys(base).forEach((key) => {
    const prop = key as keyof T
    const value = user[prop]
    if (value === undefined) {
      //@ts-ignore
      user[prop] = dom.deepClone(base[prop])
    } else {
      //@ts-ignore
      user[prop] = mergeParam(base[prop], value)
    }
  })
  return user
}
