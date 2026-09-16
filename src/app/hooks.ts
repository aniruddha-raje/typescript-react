import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Pre-typed versions of the react-redux hooks. Use these instead of the
// plain ones so components get full type inference for free.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
