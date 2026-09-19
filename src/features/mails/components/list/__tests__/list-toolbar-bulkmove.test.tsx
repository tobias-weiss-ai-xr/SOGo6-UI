import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ListToolbar from '../list-toolbar'

const mockBatchAction = jest.fn()

jest.mock('@/features/mails/hooks/use-mail-item-actions', () => ({
  useMailItemActions: jest.fn(() => ({
    deleteMail: jest.fn(),
    archiveMail: jest.fn(),
    toggleRead: jest.fn(),
    markSpam: jest.fn(),
    isJunk: false,
  })),
}))

jest.mock('@/features/mails/hooks/use-folder-messages', () => ({
  useFolderMessages: jest.fn(() => ({
    data: {
      mails: [{ id: '1' }, { id: '2' }],
      total: 2,
      page: 1,
      totalPages: 1,
    },
    isLoading: false,
    currentPage: 1,
    params: {},
  })),
}))

jest.mock('@/features/mails/store/mails-api', () => {
  const actualFolders = [
    { path: 'INBOX', name: 'INBOX', selectable: true },
    { path: 'Archive', name: 'Archive', selectable: true },
    { path: 'Trash', name: 'Trash', selectable: true },
  ]
  return {
    useGetFolderMessagesQuery: jest.fn(() => ({
      data: {
        mails: [{ id: '1' }, { id: '2' }],
        total: 2,
        page: 1,
        totalPages: 1,
      },
      isLoading: false,
    })),
    useBatchMailActionMutation: jest.fn(() => [mockBatchAction]),
    useGetFoldersQuery: jest.fn(() => ({ data: actualFolders })),
  }
})

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ folder: 'INBOX', account: '0' })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Real MailActionsBar so the move action button is exercised
jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: ({ children, onClick, disabled, tooltip }: any) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={tooltip}
      data-testid={`action-${tooltip}`}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/lib/redux/hooks', () => {
  let state = {
    mailLayout: { selectedMailIds: ['1', '2'] },
    mailNavigation: { skipFolderFetch: false },
  }
  return {
    useAppDispatch: jest.fn(() => jest.fn()),
    useAppSelector: (fn: (s: any) => any) => fn(state),
    __setState: (s: any) => {
      state = s
    },
  }
})

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

jest.mock('../list-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter" />,
}))
jest.mock('../list-filter-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter-dropdown" />,
}))
jest.mock('../list-sort', () => ({
  __esModule: true,
  default: () => <div data-testid="list-sort" />,
}))
jest.mock('../list-pagination', () => ({
  __esModule: true,
  default: () => <div data-testid="list-pagination" />,
}))
jest.mock('@/features/mails/components/mail/mail-detail-navigation', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-detail-navigation" />,
}))
jest.mock('@/features/mails/hooks/use-list-toolbar-mode', () => ({
  useListToolbarMode: jest.fn(() => 'list'),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('ListToolbar bulk move-to-folder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBatchAction.mockResolvedValue({})
  })

  it('renders a Move-to-folder bulk action when mails are selected', () => {
    render(<ListToolbar />)
    expect(
      screen.getByTestId('action-move_to_folder.string')
    ).toBeInTheDocument()
  })

  it('opens the move dialog and dispatches a batch move on confirm', async () => {
    render(<ListToolbar />)
    fireEvent.click(screen.getByTestId('action-move_to_folder.string'))
    // Dialog is open
    const confirm = screen.getByText(
      'folders.actions.move_mails_dialog.confirm.string'
    )
    expect(confirm).toBeInTheDocument()
    // Select a destination folder in the dialog's select
    fireEvent.click(screen.getByRole('combobox')).catch?.(() => {})
    const archiveOption = screen.getAllByText('Archive')[0]
    fireEvent.click(archiveOption)
    fireEvent.click(confirm)
    await new Promise((r) => setTimeout(r, 0))
    expect(mockBatchAction).toHaveBeenCalledWith({
      accountId: '0',
      folder: 'INBOX',
      action: 'move',
      mailUids: [1, 2],
      data: 'Archive',
    })
  })
})
