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
  if (dom.isPrimitve(user) || dom.isFunction(user) || Array.isArray(user)) {
    return user
  }
  if (dom.isPrimitve(base)) {
    return mergeParam(user, {} as T)
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
