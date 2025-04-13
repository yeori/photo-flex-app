import { Area, Viewport, Point } from '../scale'

export type ImageLocator = (
  subject: Viewport,
  origin: Point,
  ratio: number
) => Area
