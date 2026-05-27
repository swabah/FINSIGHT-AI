import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Login from '../Login';
import * as authService from '../../services/authService';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  setAuthData: vi.fn(),
}));

describe('Login Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));
    
    renderLogin();
    
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to dashboard on successful login', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      success: true,
      message: 'Login successful',
      data: {
        id: '1',
        username: 'test',
        email: 'test@test.com',
        token: 'token',
      }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(authService.setAuthData).toHaveBeenCalledWith(expect.objectContaining({
        token: 'token'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
