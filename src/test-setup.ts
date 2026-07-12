// Provide window.localStorage for jsdom tests. jsdom does not reliably expose
// it (opaque origin / Node's experimental global interferes), so install a
// simple in-memory Storage when running in a window (jsdom) environment.
// jsdom lacks matchMedia; stub it (nothing matches → desktop defaults).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

if (typeof window !== 'undefined' && !window.localStorage) {
  const mem = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return mem.size
    },
    clear: () => mem.clear(),
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    key: (i: number) => Array.from(mem.keys())[i] ?? null,
    removeItem: (k: string) => void mem.delete(k),
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
  }
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
}
