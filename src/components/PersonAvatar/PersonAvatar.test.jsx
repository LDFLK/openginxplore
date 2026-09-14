import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PersonAvatar from './PersonAvatar'

describe('PersonAvatar', () => {
  it('renders the image when online with a valid src', () => {
    render(<PersonAvatar isOnline imageUrl="https://example.com/a.png" name="Jane Doe" />)

    const img = screen.getByRole('img', { name: 'Jane Doe' })
    expect(img).toHaveAttribute('src', 'https://example.com/a.png')
  })

  it('falls back to the placeholder icon when offline', () => {
    const { container } = render(
      <PersonAvatar isOnline={false} imageUrl="https://example.com/a.png" name="Jane Doe" />,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('falls back to the placeholder icon when no src is provided', () => {
    const { container } = render(<PersonAvatar isOnline name="Jane Doe" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows the placeholder after the image fails to load', () => {
    const { container } = render(
      <PersonAvatar isOnline imageUrl="https://example.com/broken.png" name="Jane Doe" />,
    )

    fireEvent.error(screen.getByRole('img'))

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('prefers imageUrl over image when both are given', () => {
    render(
      <PersonAvatar
        isOnline
        imageUrl="https://example.com/primary.png"
        image="https://example.com/secondary.png"
        name="Jane Doe"
      />,
    )

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/primary.png')
  })
})
