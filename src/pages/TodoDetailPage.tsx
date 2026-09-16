import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  removeTodo,
  selectTodoById,
  toggleTodo,
} from '../features/todos/todosSlice'

export default function TodoDetailPage() {
  // The :todoId segment from the URL is the only input this page needs —
  // everything else comes from the store.
  const { todoId } = useParams<{ todoId: string }>()
  const todo = useAppSelector(selectTodoById(todoId))
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  if (!todo) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>Todo not found</h1>
          <p>
            No item with id <code>{todoId}</code> — it may have been deleted.
          </p>
        </header>
        <Link className="back-link" to="/todos">
          ← Back to todos
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <Link className="back-link" to="/todos">
        ← Back to todos
      </Link>

      <header className="page-head">
        <h1>{todo.title}</h1>
        <p>{todo.note}</p>
      </header>

      <section className="panel">
        <p>
          Status: <span className={`pill ${todo.done ? 'ok' : ''}`}>
            {todo.done ? 'Done' : 'Active'}
          </span>
        </p>
        <div className="button-row">
          <button type="button" onClick={() => dispatch(toggleTodo(todo.id))}>
            Mark as {todo.done ? 'active' : 'done'}
          </button>
          <button
            type="button"
            className="ghost danger"
            onClick={() => {
              dispatch(removeTodo(todo.id))
              navigate('/todos')
            }}
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  )
}
