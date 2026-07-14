import { Capacitor } from '@capacitor/core'

/**
 * Native-shell integration, all guarded by `isNative()` so the web build is
 * completely unaffected. The plugin packages are dynamically imported and only
 * loaded on a real device (they never execute — or download — on the web).
 */

export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * One-time shell setup: dark status bar over the stage colour, and an Android
 * hardware back-button handler. `onBack` returns true if it handled the press
 * (navigated); when it returns false and there's no web history, the app exits.
 */
export async function initNativeShell(onBack: () => boolean): Promise<void> {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0f141b' })
  } catch {
    // status-bar unavailable — ignore
  }
  try {
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', ({ canGoBack }) => {
      const handled = onBack()
      if (!handled && !canGoBack) App.exitApp()
    })
  } catch {
    // app plugin unavailable — ignore
  }
}

/** Lock to landscape (Practice); no-op on web. */
export async function lockLandscape(): Promise<void> {
  if (!isNative()) return
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation')
    await ScreenOrientation.lock({ orientation: 'landscape' })
  } catch {
    // orientation plugin unavailable — ignore
  }
}

/** Release the orientation lock (leaving Practice); no-op on web. */
export async function unlockOrientation(): Promise<void> {
  if (!isNative()) return
  try {
    const { ScreenOrientation } = await import('@capacitor/screen-orientation')
    await ScreenOrientation.unlock()
  } catch {
    // orientation plugin unavailable — ignore
  }
}
