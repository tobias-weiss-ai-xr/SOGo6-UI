/**
 * KeyboardNavigator Component Tests
 *
 * Tests for keyboard navigation components.
 * WCAG 2.1: 2.1.1 Keyboard (Level A)
 * WCAG 2.1: 2.1.2 No Keyboard Trap (Level A)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  KeyboardListNavigator,
  KeyboardGridNavigator,
  KeyboardTabList,
  KeyboardTabPanel,
  useKeyboardShortcut,
} from '../KeyboardNavigator';

describe('KeyboardListNavigator', () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];

  it('renders children', () => {
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('has role="listbox"', () => {
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    const container = screen.getByRole('listbox');
    expect(container).toBeInTheDocument();
  });

  it('has tabIndex={0}', () => {
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    expect(screen.getByRole('listbox')).toHaveAttribute('tabindex', '0');
  });

  it('has aria-activedescendant attribute', () => {
    render(
      <KeyboardListNavigator
        selectedIndex={1}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    const container = screen.getByRole('listbox');
    expect(container).toHaveAttribute('aria-activedescendant', 'item-1');
  });

  it('navigates down on ArrowDown key', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenCalledWith(1);
  });

  it('navigates up on ArrowUp key', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={2}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowUp' });
    expect(onSelectionChange).toHaveBeenCalledWith(1);
  });

  it('wraps around at top when circular', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={true}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowUp' });
    expect(onSelectionChange).toHaveBeenCalledWith(2);
  });

  it('wraps around at bottom when circular', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={2}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={true}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it('does not go below 0 when not circular', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowUp' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('does not go above max when not circular', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={2}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('calls onSelect on Enter key', () => {
    const onSelect = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={1}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
        onSelect={onSelect}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('calls onSelect on Space key', () => {
    const onSelect = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
        onSelect={onSelect}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('calls onEscape on Escape key', () => {
    const onEscape = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
        onEscape={onEscape}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });

  it('navigates to first item on Home key', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={2}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Home' });
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it('navigates to last item on End key', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'End' });
    expect(onSelectionChange).toHaveBeenCalledWith(2);
  });

  it('supports horizontal orientation', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        orientation="horizontal"
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowRight' });
    expect(onSelectionChange).toHaveBeenCalledWith(1);
  });

  it('ignores horizontal keys in vertical orientation', () => {
    const onSelectionChange = jest.fn();
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        orientation="vertical"
        circular={false}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowRight' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
        className="my-list"
      >
        <div>Item</div>
      </KeyboardListNavigator>
    );

    expect(screen.getByRole('listbox')).toHaveClass('keyboard-list-navigator', 'my-list');
  });
});

describe('KeyboardGridNavigator', () => {
  it('renders children', () => {
    render(
      <KeyboardGridNavigator
        position={{ row: 0, col: 0 }}
        dimensions={{ rows: 2, cols: 2 }}
        onPositionChange={jest.fn()}
      >
        <div>Cell 1</div>
        <div>Cell 2</div>
      </KeyboardGridNavigator>
    );

    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('has role="grid"', () => {
    render(
      <KeyboardGridNavigator
        position={{ row: 0, col: 0 }}
        dimensions={{ rows: 2, cols: 2 }}
        onPositionChange={jest.fn()}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('has aria-activedescendant attribute', () => {
    render(
      <KeyboardGridNavigator
        position={{ row: 1, col: 2 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={jest.fn()}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-activedescendant', 'cell-1-2');
  });

  it('navigates row down on ArrowDown', () => {
    const onPositionChange = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 0, col: 0 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={onPositionChange}
        circular={false}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowDown' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 1, col: 0 });
  });

  it('navigates column right on ArrowRight', () => {
    const onPositionChange = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 0, col: 0 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={onPositionChange}
        circular={false}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 0, col: 1 });
  });

  it('navigates to home position on Home key', () => {
    const onPositionChange = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 2, col: 2 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={onPositionChange}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Home' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 0, col: 0 });
  });

  it('navigates to end position on End key', () => {
    const onPositionChange = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 0, col: 0 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={onPositionChange}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'End' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 2, col: 2 });
  });

  it('calls onSelect on Enter key', () => {
    const onSelect = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 1, col: 1 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={jest.fn()}
        onSelect={onSelect}
      >
        <div>Cell</div>
      </KeyboardGridNavigator>
    );

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith({ row: 1, col: 1 });
  });
});

describe('KeyboardTabList', () => {
  it('renders children', () => {
    render(
      <KeyboardTabList selectedIndex={0} onChange={jest.fn()}>
        <div>Tab 1</div>
        <div>Tab 2</div>
      </KeyboardTabList>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('has role="tablist"', () => {
    render(
      <KeyboardTabList selectedIndex={0} onChange={jest.fn()}>
        <div>Tab</div>
      </KeyboardTabList>
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('navigates right on ArrowRight', () => {
    const onChange = jest.fn();
    render(
      <KeyboardTabList selectedIndex={0} onChange={onChange} circular={false}>
        <div>Tab 1</div>
        <div>Tab 2</div>
        <div>Tab 3</div>
      </KeyboardTabList>
    );

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('navigates left on ArrowLeft', () => {
    const onChange = jest.fn();
    render(
      <KeyboardTabList selectedIndex={2} onChange={onChange} circular={false}>
        <div>Tab 1</div>
        <div>Tab 2</div>
        <div>Tab 3</div>
      </KeyboardTabList>
    );

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('KeyboardTabPanel', () => {
  it('renders children when selected', () => {
    render(
      <KeyboardTabPanel index={0} selectedIndex={0}>
        <div data-testid="panel-content">Panel Content</div>
      </KeyboardTabPanel>
    );

    expect(screen.getByTestId('panel-content')).toBeInTheDocument();
  });

  it('does not render children when not selected', () => {
    render(
      <KeyboardTabPanel index={1} selectedIndex={0}>
        <div data-testid="panel-content">Panel Content</div>
      </KeyboardTabPanel>
    );

    expect(screen.queryByTestId('panel-content')).not.toBeInTheDocument();
  });

  it('has role="tabpanel"', () => {
    render(
      <KeyboardTabPanel index={0} selectedIndex={0}>
        <div>Content</div>
      </KeyboardTabPanel>
    );

    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('is aria-hidden when not selected', () => {
    render(
      <KeyboardTabPanel index={1} selectedIndex={0}>
        <div>Content</div>
      </KeyboardTabPanel>
    );

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Accessibility Compliance', () => {
  it('KeyboardListNavigator supports full keyboard navigation (WCAG 2.1.1)', () => {
    const onSelectionChange = jest.fn();
    const onSelect = jest.fn();
    const items = ['A', 'B', 'C'];

    render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={onSelectionChange}
        onSelect={onSelect}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    // All functionality must be keyboard accessible
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('tabindex', '0');

    // Arrow keys move selection
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenCalledWith(1);

    // Enter/Space activate selection
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(1);

    // Home/End jump to first/last
    fireEvent.keyDown(listbox, { key: 'Home' });
    expect(onSelectionChange).toHaveBeenCalledWith(0);

    // Escape dismisses
    const onEscape = jest.fn();
    const { rerender } = render(
      <KeyboardListNavigator
        selectedIndex={0}
        itemCount={items.length}
        onSelectionChange={jest.fn()}
        onEscape={onEscape}
      >
        {items.map((item, i) => (
          <div key={i} id={`item-${i}`}>{item}</div>
        ))}
      </KeyboardListNavigator>
    );

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });

  it('KeyboardGridNavigator supports 2D navigation', () => {
    const onPositionChange = jest.fn();
    render(
      <KeyboardGridNavigator
        position={{ row: 1, col: 1 }}
        dimensions={{ rows: 3, cols: 3 }}
        onPositionChange={onPositionChange}
        circular={false}
      >
        <div>Grid</div>
      </KeyboardGridNavigator>
    );

    const grid = screen.getByRole('grid');

    // 2D navigation with arrow keys
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 0, col: 1 });

    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 2, col: 1 });

    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 2, col: 0 });

    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(onPositionChange).toHaveBeenCalledWith({ row: 2, col: 2 });
  });
});
