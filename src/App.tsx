import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import CounterPage from './pages/CounterPage'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'
import TodoDetailPage from './pages/TodoDetailPage'
import TodosPage from './pages/TodosPage'

export default function App() {
  return (
    <Routes>
      {/* Layout renders the chrome once and <Outlet /> swaps the page. */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="login" element={<LoginPage />} />

        {/* Everything nested in RequireAuth redirects to /login when
            signed out. Adding a protected route means adding it here. */}
        <Route element={<RequireAuth />}>
          <Route path="counter" element={<CounterPage />} />
          <Route path="todos" element={<TodosPage />} />
          <Route path="todos/:todoId" element={<TodoDetailPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
