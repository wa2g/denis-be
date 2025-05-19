export type UserRole = 'order_manager' | 'accountant' | 'manager' | 'ceo' | 'admin' | 'customer';

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