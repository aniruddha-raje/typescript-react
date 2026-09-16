import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

type CounterState = {
  value: number
  status: 'idle' | 'loading'
}

const initialState: CounterState = {
  value: 0,
  status: 'idle',
}

// Stands in for a real API call so the pending/fulfilled flow is visible.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const incrementAsync = createAsyncThunk(
  'counter/incrementAsync',
  async (amount: number) => {
    await delay(700)
    return amount
  },
)

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Immer lets us "mutate" here — the updates are applied immutably.
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    reset(state) {
      state.value = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.value += action.payload
      })
      .addCase(incrementAsync.rejected, (state) => {
        state.status = 'idle'
      })
  },
})

export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions

export const selectCount = (state: RootState) => state.counter.value
export const selectCounterStatus = (state: RootState) => state.counter.status

export default counterSlice.reducer
