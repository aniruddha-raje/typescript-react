import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import { authListenerMiddleware } from '../features/auth/authPersistence'
import counterReducer from '../features/counter/counterSlice'
import todosReducer from '../features/todos/todosSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
    todos: todosReducer,
  },
  // prepend, so the listener sees actions before the default middleware does.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
})

// Inferred from the store itself, so the types stay correct as reducers change.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
