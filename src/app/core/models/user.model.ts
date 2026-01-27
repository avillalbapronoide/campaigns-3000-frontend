export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
