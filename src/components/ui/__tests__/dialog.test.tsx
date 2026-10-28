import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

describe('DialogOverlay Component', () => {
  it('renders the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByRole('dialog').parentElement
    expect(overlay).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    expect(asFragment()).toMatchSnapshot()
  })

  it('applies custom className to DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay className="custom-class" />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByText('Dialog Content').previousElementSibling
    expect(overlay).toHaveClass('custom-class')
  })

  it('forwards additional props to the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay data-testid="dialog-overlay" />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByTestId('dialog-overlay')
    expect(overlay).toBeInTheDocument()
  })
})

describe('Dialog close button', () => {
  // Regression: without an explicit size + flex centering the close button
  // inherited the (now removed) 44px blanket floor — the X icon sat
  // top-left in an oversized box and the hover/focus ring was asymmetric.
  it('has an explicit square size and centers its icon', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    fireEvent.click(screen.getByText('Open Dialog'))

    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(closeButton).toHaveClass('h-7')
    expect(closeButton).toHaveClass('w-7')
    expect(closeButton).toHaveClass('flex')
    expect(closeButton).toHaveClass('items-center')
    expect(closeButton).toHaveClass('justify-center')
  })
})
