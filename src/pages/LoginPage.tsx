import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  errorCleared,
  login,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
} from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Where RequireAuth was trying to send them before the redirect.
  const from = (location.state as { from?: string } | null)?.from ?? '/counter'

  // Already signed in? Nothing to do here.
  if (isAuthenticated) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // `unwrap()` re-throws the rejection so success and failure split here
    // instead of having to inspect the action.
    try {
      await dispatch(login({ username: username.trim(), password })).unwrap()
      navigate(from, { replace: true })
    } catch {
      // The message is already in the store; the form renders it below.
    }
  }

  const isSubmitting = status === 'loading'

  return (
    <div className="page login-page">
      <section className="panel login-card">
        <header className="login-head">
          <span className="brand-mark">RR</span>
          <h1>Sign in</h1>
          <p>The counter and todos demos are behind this screen.</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                if (error) dispatch(errorCleared())
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) dispatch(errorCleared())
              }}
            />
          </div>

          <button type="submit" disabled={!username || !password || isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-hint">
          Demo credentials: <code>admin</code> / <code>admin</code>
        </p>
      </section>
    </div>
  )
}
