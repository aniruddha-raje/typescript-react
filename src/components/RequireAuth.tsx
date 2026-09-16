import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectIsAuthenticated } from '../features/auth/authSlice'

/**
 * Route guard. Used as a layout route: anything nested inside it requires a
 * signed-in user, and `<Outlet />` renders the matched child once that holds.
 *
 * The persisted token is read synchronously when the store is created, so
 * there is no "still checking" state to render — the redirect can happen on
 * the first render with no spinner and no flash of protected content.
 */
export default function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back there.
    // `replace` keeps the guarded URL out of the history stack, so the back
    // button doesn't bounce between it and the login screen.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
