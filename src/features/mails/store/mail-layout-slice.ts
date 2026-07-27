import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MailLayoutMode = 'full' | 'split'
export type MailViewMode = 'flat' | 'conversation'

const LAYOUT_KEY = 'sogo_mail_layout'
const VIEW_KEY = 'sogo_mail_view'

interface MailLayoutState {
  mode: MailLayoutMode
  viewMode: MailViewMode
  selectedMailIds: string[]
}

function loadInitialState(): MailLayoutState {
  let mode: MailLayoutMode = 'full'
  let viewMode: MailViewMode = 'flat'
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LAYOUT_KEY)
      if (saved === 'full' || saved === 'split') mode = saved
      const savedView = localStorage.getItem(VIEW_KEY)
      if (savedView === 'flat' || savedView === 'conversation') viewMode = savedView
    } catch {
      // ignore
    }
  }
  return { mode, viewMode, selectedMailIds: [] }
}

const initialState: MailLayoutState = loadInitialState()

const mailLayoutSlice = createSlice({
  name: 'mailLayout',
  initialState,
  reducers: {
    setMailLayout(state, action: PayloadAction<MailLayoutMode>) {
      state.mode = action.payload
      try { localStorage.setItem(LAYOUT_KEY, action.payload) } catch {}
    },
    setMailViewMode(state, action: PayloadAction<MailViewMode>) {
      state.viewMode = action.payload
      try { localStorage.setItem(VIEW_KEY, action.payload) } catch {}
    },
    setSelectedMails(state, action: PayloadAction<string[]>) {
      state.selectedMailIds = action.payload
    },
    clearSelectedMails(state) {
      state.selectedMailIds = []
    },
  },
})

export const { setMailLayout, setMailViewMode, setSelectedMails, clearSelectedMails } = mailLayoutSlice.actions
export default mailLayoutSlice.reducer
