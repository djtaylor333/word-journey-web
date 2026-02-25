import React from 'react';
import { render, screen } from '@testing-library/react';
import { LockOverlay } from './LockOverlay';

describe('LockOverlay', () => {
  it('renders the overlay with the correct message', () => {
    render(<LockOverlay message="VIP Feature - Subscribe to unlock" />);
    expect(screen.getByText('VIP Feature - Subscribe to unlock')).toBeTruthy();
  });
});
