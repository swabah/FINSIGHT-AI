import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../useForm';
import type { ChangeEvent } from 'react';

describe('useForm Hook', () => {
  it('should initialize with initial state', () => {
    const { result } = renderHook(() => useForm({ username: 'test', email: 'test@test.com' }));
    
    expect(result.current.formData).toEqual({
      username: 'test',
      email: 'test@test.com',
    });
  });

  it('should update form data on change', () => {
    const { result } = renderHook(() => useForm({ username: '' }));
    
    act(() => {
      const event = {
        target: { value: 'newuser' },
      } as ChangeEvent<HTMLInputElement>;
      
      result.current.handleChange('username')(event);
    });
    
    expect(result.current.formData.username).toBe('newuser');
  });

  it('should reset form to initial state', () => {
    const initialState = { username: 'initial' };
    const { result } = renderHook(() => useForm(initialState));
    
    act(() => {
      result.current.handleChange('username')({ target: { value: 'changed' } } as ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.formData.username).toBe('changed');
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.formData).toEqual(initialState);
  });
});
