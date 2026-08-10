import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ImapMessagesList } from '../mails-types'

export interface MailSearchState {
  /**
   * Whether a search is currently active.
   */
  isActive: boolean
  /**
   * The search query text.
   */
  query: string
  /**
   * Additional search parameters sent to the backend.
   */
  searchParams: Record<string, string | boolean | undefined>
  /**
   * Search results (page of mails).
   */
  results: ImapMessagesList[]
  /**
   * Total number of matching mails.
   */
  total: number
  /**
   * Current page of results.
   */
  page: number
  /**
   * Total pages of results.
   */
  totalPages: number
}

const initialState: MailSearchState = {
  isActive: false,
  query: '',
  searchParams: {},
  results: [],
  total: 0,
  page: 1,
  totalPages: 1,
}

const mailSearchSlice = createSlice({
  name: 'mailSearch',
  initialState,
  reducers: {
    activateSearch(
      state,
      action: PayloadAction<{
        query: string
        searchParams: Record<string, string | boolean | undefined>
      }>
    ) {
      state.isActive = true
      state.query = action.payload.query
      state.searchParams = action.payload.searchParams
      state.results = []
      state.total = 0
      state.page = 1
      state.totalPages = 1
    },
    setSearchResults(
      state,
      action: PayloadAction<{
        results: ImapMessagesList[]
        total: number
        page: number
        totalPages: number
      }>
    ) {
      state.results = action.payload.results
      state.total = action.payload.total
      state.page = action.payload.page
      state.totalPages = action.payload.totalPages
    },
    clearSearch(state) {
      state.isActive = false
      state.query = ''
      state.searchParams = {}
      state.results = []
      state.total = 0
      state.page = 1
      state.totalPages = 1
    },
    setSearchPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
  },
})

export const {
  activateSearch,
  setSearchResults,
  clearSearch,
  setSearchPage,
} = mailSearchSlice.actions

export const selectMailSearch = (state: {
  mailSearch: MailSearchState
}) => state.mailSearch

export default mailSearchSlice.reducer
