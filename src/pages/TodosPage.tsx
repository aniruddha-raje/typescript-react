import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import type { Filter } from '../features/todos/todosSlice'
import {
  addTodo,
  clearCompleted,
  selectFilter,
  selectTodoStats,
  selectVisibleTodos,
  setFilter,
  toggleTodo,
} from '../features/todos/todosSlice'

const filters: Filter[] = ['all', 'active', 'done']

export default function TodosPage() {
  const todos = useAppSelector(selectVisibleTodos)
  const filter = useAppSelector(selectFilter)
  const stats = useAppSelector(selectTodoStats)
  const dispatch = useAppDispatch()

  const [title, setTitle] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    dispatch(addTodo(trimmed, 'Added from the todos page.'))
    setTitle('')
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Todos</h1>
        <p>
          List state in one slice, filtered by a memoized selector. Each row links
          to a detail route.
        </p>
      </header>

      <section className="panel">
        <form className="field-row" onSubmit={handleSubmit}>
          <input
            aria-label="New todo"
            placeholder="What needs doing?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        <div className="toolbar">
          <div className="segmented" role="group" aria-label="Filter todos">
            {filters.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                className={filter === option ? 'active' : undefined}
                onClick={() => dispatch(setFilter(option))}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ghost"
            disabled={stats.done === 0}
            onClick={() => dispatch(clearCompleted())}
          >
            Clear completed ({stats.done})
          </button>
        </div>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : undefined}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => dispatch(toggleTodo(todo.id))}
                aria-label={`Mark "${todo.title}" as ${todo.done ? 'active' : 'done'}`}
              />
              <Link to={`/todos/${todo.id}`}>{todo.title}</Link>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="empty">Nothing here for the “{filter}” filter.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
