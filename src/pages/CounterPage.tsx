import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  reset,
  selectCount,
  selectCounterStatus,
} from '../features/counter/counterSlice'

export default function CounterPage() {
  const count = useAppSelector(selectCount)
  const status = useAppSelector(selectCounterStatus)
  const dispatch = useAppDispatch()

  // Local UI state stays local — only what's shared belongs in the store.
  const [amount, setAmount] = useState(5)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Counter</h1>
        <p>Sync reducers, a payload action, and an async thunk with a pending state.</p>
      </header>

      <section className="panel counter-panel">
        <output className="counter-value">{count}</output>
        <div className="button-row">
          <button type="button" onClick={() => dispatch(decrement())}>
            −1
          </button>
          <button type="button" onClick={() => dispatch(increment())}>
            +1
          </button>
          <button type="button" className="ghost" onClick={() => dispatch(reset())}>
            Reset
          </button>
        </div>

        <div className="field-row">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value) || 0)}
          />
          <button type="button" onClick={() => dispatch(incrementByAmount(amount))}>
            Add
          </button>
          <button
            type="button"
            className="ghost"
            disabled={status === 'loading'}
            onClick={() => dispatch(incrementAsync(amount))}
          >
            {status === 'loading' ? 'Adding…' : 'Add after 700ms'}
          </button>
        </div>
      </section>

      <section className="notes">
        <h3>What to look at</h3>
        <ul>
          <li>
            <code>incrementByAmount</code> takes a typed <code>PayloadAction</code>.
          </li>
          <li>
            <code>incrementAsync</code> is a thunk; its <code>pending</code> and{' '}
            <code>fulfilled</code> cases are handled in <code>extraReducers</code>.
          </li>
          <li>Reducers look mutable thanks to Immer, but updates are immutable.</li>
        </ul>
      </section>
    </div>
  )
}
