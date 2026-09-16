import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import type { AppDispatch } from '../../app/store'
import { TOKEN_STORAGE_KEY, loadToken, loggedOut, login, tokenSynced } from './authSlice'

// Reducers must stay pure, so writing the token to localStorage happens here
// instead. The listener middleware is RTK's built-in place for side effects
// that should fire in response to actions.
export const authListenerMiddleware = createListenerMiddleware()

authListenerMiddleware.startListening({
  matcher: isAnyOf(login.fulfilled, loggedOut),
  effect: (action) => {
    try {
      if (login.fulfilled.match(action)) {
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload)
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    } catch {
      // Storage unavailable (private mode). The session still works for this
      // tab; it just won't survive a reload.
    }
  },
})

/**
 * Keep tabs in step: signing out in one tab signs out the others.
 *
 * The `storage` event only fires in *other* tabs, which is exactly what's
 * needed — this tab's own writes are already reflected in the store.
 */
export function startAuthSync(dispatch: AppDispatch): () => void {
  const onStorage = (event: StorageEvent) => {
    // `key` is null when another tab calls localStorage.clear().
    if (event.key !== null && event.key !== TOKEN_STORAGE_KEY) return
    dispatch(tokenSynced(loadToken()))
  }

  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
