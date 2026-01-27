export interface Subscriber {
  id: number;
  name: string;
  email: string;
  status: 'suscrito' | 'pendiente' | 'baja';
  role?: 'ADMIN' | 'USER';
  user_id?: number;
  active_until?: string;
  unsubscribe_token?: string;
  created_at: string;
  interests?: string[];
}
