import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type Todo = {
  id: string
  title: string
  note: string
  done: boolean
}

export type Filter = 'all' | 'active' | 'done'

type TodosState = {
  items: Todo[]
  filter: Filter
}

const initialState: TodosState = {
  items: [
    {
      id: 'seed-1',
      title: 'Read the Redux Toolkit docs',
      note: 'createSlice, createAsyncThunk and createSelector cover most needs.',
      done: true,
    },
    {
      id: 'seed-2',
      title: 'Add a route with a URL parameter',
      note: 'Open any item below — the detail page reads :todoId from the URL.',
      done: false,
    },
    {
      id: 'seed-3',
      title: 'Wire a component to the store',
      note: 'useAppSelector to read, useAppDispatch to write.',
      done: false,
    },
  ],
  filter: 'all',
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // `prepare` keeps id generation out of the reducer, which must stay pure.
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.items.unshift(action.payload)
      },
      prepare(title: string, note: string) {
        return { payload: { id: nanoid(), title, note, done: false } }
      },
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find((item) => item.id === action.payload)
      if (todo) todo.done = !todo.done
    },
    removeTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    setFilter(state, action: PayloadAction<Filter>) {
      state.filter = action.payload
    },
    clearCompleted(state) {
      state.items = state.items.filter((item) => !item.done)
    },
  },
})

export const { addTodo, toggleTodo, removeTodo, setFilter, clearCompleted } =
  todosSlice.actions

export const selectTodos = (state: RootState) => state.todos.items
export const selectFilter = (state: RootState) => state.todos.filter

// Memoized: the filtered array is only rebuilt when items or filter change,
// so components reading it don't re-render on unrelated store updates.
export const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (items, filter) => {
    if (filter === 'active') return items.filter((item) => !item.done)
    if (filter === 'done') return items.filter((item) => item.done)
    return items
  },
)

export const selectTodoStats = createSelector([selectTodos], (items) => ({
  total: items.length,
  done: items.filter((item) => item.done).length,
  active: items.filter((item) => !item.done).length,
}))

export const selectTodoById = (id: string | undefined) => (state: RootState) =>
  state.todos.items.find((item) => item.id === id)

export default todosSlice.reducer
