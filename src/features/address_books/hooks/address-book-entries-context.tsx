'use client'

import { ALL_CONTACTS_BOOK_ID } from '../address-books-constants'
import type { VCard } from '../address-books-types'
import { useAddressBookEntries } from './use-address-book-entries'
import { useAllContactsEntries } from './use-all-contacts-entries'
import React, { createContext, useContext } from 'react'

// The two hooks return nearly identical shapes; useAllContactsEntries adds a
// bookId field and the refetch types differ (different RTK queries). Define
// the context value structurally so both are assignable.
type AddressBookEntriesValue = {
  items: VCard[]
  total: number
  contactTotal: number
  listTotal: number
  page: number
  totalPages: number
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
  searchTooShort: boolean
  minSearchLength: number
  bookId?: string
}

const AddressBookEntriesContext = createContext<AddressBookEntriesValue | null>(
  null
)

export function AddressBookEntriesProvider({
  bookId,
  children,
}: {
  bookId: string | null
  children: React.ReactNode
}) {
  const isAllContactsView = bookId === ALL_CONTACTS_BOOK_ID
  const bookEntries = useAddressBookEntries(isAllContactsView ? null : bookId)
  const allContactsEntries = useAllContactsEntries(isAllContactsView)
  const value = isAllContactsView ? allContactsEntries : bookEntries

  return (
    <AddressBookEntriesContext.Provider value={value}>
      {children}
    </AddressBookEntriesContext.Provider>
  )
}

export function useAddressBookEntriesContext(): AddressBookEntriesValue {
  const context = useContext(AddressBookEntriesContext)
  if (!context) {
    throw new Error(
      'useAddressBookEntriesContext must be used within AddressBookEntriesProvider'
    )
  }
  return context
}
