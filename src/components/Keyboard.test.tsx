import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard component', () => {
  it('calls onKeyPress when a key is clicked', () => {
    const onKeyPress = jest.fn();
    const { getByText } = render(<Keyboard onKeyPress={onKeyPress} wordLength={5} />);
    fireEvent.click(getByText('A'));
    expect(onKeyPress).toHaveBeenCalledWith('A');
    fireEvent.click(getByText('⌫'));
    expect(onKeyPress).toHaveBeenCalledWith('BACKSPACE');
    fireEvent.click(getByText('⏎'));
    expect(onKeyPress).toHaveBeenCalledWith('ENTER');
  });
});
