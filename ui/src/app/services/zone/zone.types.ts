export interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  leader: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}
