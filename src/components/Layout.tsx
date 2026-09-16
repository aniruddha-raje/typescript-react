import { NavLink, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  loggedOut,
  selectIsAuthenticated,
  selectUsername,
} from '../features/auth/authSlice'
import { selectCount } from '../features/counter/counterSlice'
import { selectTodoStats } from '../features/todos/todosSlice'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/counter', label: 'Counter', end: false },
  { to: '/todos', label: 'Todos', end: false },
]

export default function Layout() {
  // Read from the store here too: the numbers stay in sync as you navigate,
  // which is the whole point of keeping state outside the route tree.
  const count = useAppSelector(selectCount)
  const stats = useAppSelector(selectTodoStats)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const username = useAppSelector(selectUsername)

  const dispatch = useAppDispatch()

  function handleSignOut() {
    // Just clear the token — deliberately no navigate() here.
    //
    // RequireAuth is still mounted when the store updates, so it sees the
    // missing token and redirects to /login itself. Trying to navigate to a
    // friendlier destination from this handler does not work: React Router
    // commits location changes inside a transition, so the router's location
    // is still the guarded route when the dispatch forces its synchronous
    // re-render, and the guard's <Navigate> wins the race. (flushSync doesn't
    // help — it updates the history entry, not the router's React state.)
    //
    // Letting the guard own the redirect is also better behaviour: it records
    // the page being left in location.state, so signing back in returns there.
    dispatch(loggedOut())
  }

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">RR</span>
          <span>Router + Redux</span>
        </NavLink>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="auth-area">
          {isAuthenticated ? (
            <>
              <span className="user-chip" title={`Signed in as ${username}`}>
                <span className="user-avatar" aria-hidden="true">
                  {username?.charAt(0).toUpperCase() ?? '?'}
                </span>
                {username}
              </span>
              <button type="button" className="ghost" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="signin-link">
              Sign in
            </NavLink>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="statusbar">
        <span>
          Store snapshot — counter: <strong>{count}</strong>
        </span>
        <span>
          todos: <strong>{stats.active}</strong> active / <strong>{stats.total}</strong> total
        </span>
        <span>
          auth: <strong>{isAuthenticated ? username : 'signed out'}</strong>
        </span>
      </footer>
    </div>
  )
}
