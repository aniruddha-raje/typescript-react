import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>404</h1>
        <p>That route isn’t in the route table.</p>
      </header>
      <Link className="back-link" to="/">
        ← Back home
      </Link>
    </div>
  )
}
