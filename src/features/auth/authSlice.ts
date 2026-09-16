import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { decodeToken, isTokenExpired, mintMockToken } from './jwt'

export const TOKEN_STORAGE_KEY = 'typescript_react_token'

// The credentials the mock login accepts. Override them in a .env file
// (see .env.example). These are VITE_-prefixed and therefore bundled into the
// client — fine for a demo login, never a substitute for real authentication.
const MOCK_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin'
const MOCK_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin'

/**
 * Read a still-valid token out of localStorage.
 *
 * Wrapped in try/catch because storage access throws outright in some
 * privacy modes — a demo login should degrade to "signed out", not crash.
 */
export function loadToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    return stored && !isTokenExpired(stored) ? stored : null
  } catch {
    return null
  }
}

type AuthState = {
  token: string | null
  status: 'idle' | 'loading'
  error: string | null
}

// This app renders only in the browser, so the persisted token is available
// synchronously at store-creation time. That is why there is no `isReady`
// flag and no loading spinner in the route guard: by the time React renders,
// the answer to "is this user signed in?" is already known, so guards can
// redirect immediately without a flash of the wrong screen.
const initialState: AuthState = {
  token: loadToken(),
  status: 'idle',
  error: null,
}

/**
 * Validates credentials and mints a token. The short delay stands in for a
 * network round trip so the button's pending state is actually visible.
 */
export const login = createAsyncThunk<
  string,
  { username: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ username, password }, { rejectWithValue }) => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (username !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
    return rejectWithValue('Invalid username or password.')
  }

  return mintMockToken(username)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedOut(state) {
      state.token = null
      state.error = null
    },
    // Dispatched when another tab changes the token — see startAuthSync.
    tokenSynced(state, action: PayloadAction<string | null>) {
      state.token = action.payload
    },
    errorCleared(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.token = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        // `payload` is set by rejectWithValue; anything else was a real throw.
        state.error = action.payload ?? 'Something went wrong. Try again.'
      })
  },
})

export const { loggedOut, tokenSynced, errorCleared } = authSlice.actions

export const selectToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.token !== null
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error

// Memoized so the token is only decoded when it actually changes.
export const selectUsername = createSelector([selectToken], (token) =>
  token ? (decodeToken(token)?.sub ?? null) : null,
)

export default authSlice.reducer
