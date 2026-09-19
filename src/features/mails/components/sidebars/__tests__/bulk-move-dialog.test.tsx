import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BulkMoveDialog, flattenFolderPaths } from '../bulk-move-dialog'

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(() => ({
    data: [
      {
        path: 'INBOX',
        name: 'INBOX',
        selectable: true,
        subfolders: [{ path: 'INBOX/Work', name: 'Work', selectable: true }],
      },
      {
        path: 'Archive',
        name: 'Archive',
        selectable: true,
      },
      {
        path: 'NoSelect',
        name: 'NoSelect',
        selectable: false,
      },
    ],
  })),
}))

jest.mock('@/components/ui/select', () => {
  const ReactMock = require('react')
  return {
    Select: ({ value, onValueChange, children }: any) => (
      <div data-testid="select">
        {children}
        <div data-testid="select-items">
          {/* items injected via children traversal below are not rendered; see tests */}
        </div>
      </div>
    ),
    SelectTrigger: ({ children }: any) => (
      <button type="button" data-testid="select-trigger">
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
    SelectContent: ({ children }: any) => (
      <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({ children, onClick, value }: any) => (
      <div role="option" data-testid={`option-${value}`}>
        {children}
      </div>
    ),
  }
})

jest.mock('@/components/ui/alert-dialog', () => {
  const ReactMock = require('react')
  return {
    AlertDialog: ({ open, children }: any) =>
      open ? <div data-testid="alert-dialog">{children}</div> : null,
    AlertDialogContent: ({ children }: any) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
    AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogCancel: ({ children }: any) => (
      <button type="button">{children}</button>
    ),
  }
})

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('flattenFolderPaths', () => {
  const folders = [
    {
      path: 'INBOX',
      name: 'INBOX',
      selectable: true,
      subfolders: [{ path: 'INBOX/Work', name: 'Work', selectable: true }],
    },
    { path: 'Archive', name: 'Archive', selectable: true },
    { path: 'Hidden', name: 'Hidden', selectable: false },
  ] as any

  it('excludes the current folder and its subtree', () => {
    const paths = flattenFolderPaths(folders, 'INBOX').map((f) => f.path)
    expect(paths).not.toContain('INBOX')
    expect(paths).not.toContain('INBOX/Work')
    expect(paths).toContain('Archive')
  })

  it('skips non-selectable folders', () => {
    const paths = flattenFolderPaths(folders, 'INBOX').map((f) => f.path)
    expect(paths).not.toContain('Hidden')
  })

  it('renders a readable label for nested folders', () => {
    const entry = flattenFolderPaths(folders, 'Other')[1]
    expect(entry.label).toBe('INBOX / Work')
  })
})

describe('BulkMoveDialog', () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    accountId: '0',
    currentFolder: 'INBOX',
    count: 3,
    submitting: false,
    onSubmit: jest.fn(),
  }

  it('renders the destination select in the dialog', () => {
    render(<BulkMoveDialog {...baseProps} />)
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
  })

  it('does not call submit before a destination is chosen', () => {
    render(<BulkMoveDialog {...baseProps} />)
    const confirm = screen.getByText(
      'folders.actions.move_mails_dialog.confirm.string'
    )
    expect(confirm).toBeDisabled()
  })
})
