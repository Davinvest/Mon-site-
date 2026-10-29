import { connecteurLgdf } from './lgdf'
import { connecteurLocal } from './local'
import type { Connecteur } from './types'

export function connecteur(): Connecteur {
  return process.env.CONNECTEUR === 'lgdf' ? connecteurLgdf : connecteurLocal
}
