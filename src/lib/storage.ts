/**
 * The single place the app touches persistent storage.
 *
 * Everything goes through here so that swapping the backend later is a one-file
 * change. Today it's `window.localStorage` (persistent inside a Capacitor
 * WebView too). To move to `@capacitor/preferences` (async), hydrate a
 * synchronous in-memory cache from Preferences at app start and keep this same
 * synchronous API — callers (React state initializers) never change.
 *
 * All access is defensive: private-mode, disabled storage, or a missing
 * `window` degrade to no-ops / fallbacks rather than throwing.
 */

function backend(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}

export function getItem(key: string): string | null {
  try {
    return backend()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function setItem(key: string, value: string): void {
  try {
    backend()?.setItem(key, value)
  } catch {
    // quota / disabled — ignore
  }
}

export function removeItem(key: string): void {
  try {
    backend()?.removeItem(key)
  } catch {
    // ignore
  }
}

/** Read + JSON-parse, returning `fallback` on absence or malformed data. */
export function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** JSON-stringify + write. */
export function setJSON<T>(key: string, value: T): void {
  setItem(key, JSON.stringify(value))
}
