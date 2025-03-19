export type UserRole = 'order_manager' | 'accountant' | 'manager' | 'ceo' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
} 