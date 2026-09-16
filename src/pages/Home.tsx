import { Link } from 'react-router-dom'

const cards = [
  {
    to: '/counter',
    title: 'Counter',
    blurb: 'A slice with sync reducers and an async thunk, read through typed selectors.',
    tags: ['createSlice', 'createAsyncThunk'],
  },
  {
    to: '/todos',
    title: 'Todos',
    blurb: 'List state with filters and a detail route driven by a URL parameter.',
    tags: ['createSelector', 'useParams'],
  },
]

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">React 19 · Vite · TypeScript</p>
        <h1>Routing and state, wired up</h1>
        <p className="lede">
          Two demo pages sharing one Redux store.
        </p>
      </section>

      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="card">
            <h2>{card.title}</h2>
            <p>{card.blurb}</p>
            <div className="tags">
              {card.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
