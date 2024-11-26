export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
}