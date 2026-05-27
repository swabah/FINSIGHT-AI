import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import KPICard from '../KPICard';
import React from 'react';

// Mock the react timer logic inside KPICard
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe('KPICard Component', () => {
  it('renders title and formats amount properly', () => {
    render(<KPICard title="Total Balance" amount={1500} type="balance" />);
    
    // Check if title is rendered
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    
    // Fast forward the animation
    act(() => {
      vi.runAllTimers();
    });

    // Check if amount is rendered (formatted)
    // 1500 -> 1,500
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it('renders correct trend string', () => {
    render(<KPICard title="Income" amount={100} type="income" trend={12.5} />);
    
    expect(screen.getByText('+12.5% VELOCITY')).toBeInTheDocument();
  });

  it('renders calibrated when trend is 0 or undefined', () => {
    render(<KPICard title="Expense" amount={100} type="expense" />);
    
    expect(screen.getByText('CALIBRATED')).toBeInTheDocument();
  });
});
