export interface Campaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  status: 'borrador' | 'programada' | 'enviada';
  track_clicks?: boolean;
  categories: string[];
  sent?: number;
  opened?: number;
  scheduled_date?: number;
  sent_date?: number;
  open_rate?: number;
  created_at: number;
}
