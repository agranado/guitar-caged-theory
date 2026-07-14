import { getItem, setItem } from './storage'
import type { ColorMode } from '../components/Fretboard'

/**
 * User preferences that persist across visits (via the storage helper).
 * Defaults apply only on first visit; the last explicit choice wins after that.
 */

const COLOR_MODE_KEY = 'dl:colorMode'
const COLOR_MODES: ColorMode[] = ['current', 'function', 'people']

/** Planner ruling: `function` is the default colour mode on first contact. */
export function loadColorMode(): ColorMode {
  const v = getItem(COLOR_MODE_KEY)
  return COLOR_MODES.includes(v as ColorMode) ? (v as ColorMode) : 'function'
}

export function saveColorMode(mode: ColorMode): void {
  setItem(COLOR_MODE_KEY, mode)
}
