export interface DashboardStats {
  active_subscribers: number;
  total_campaigns: number;
  sent_campaigns: number;
  average_open_rate: number;
}

export interface SubscriberStats {
  total: number;
  by_status: Array<{ status: string; count: number }>;
}
