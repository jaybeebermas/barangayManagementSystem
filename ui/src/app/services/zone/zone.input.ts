export interface CreateZoneInput {
  zone_code: string;
  zone_name: string;
  leader?: string | null;
  status?: boolean;
}

export interface UpdateZoneInput {
  id: string;
  zone_code?: string;
  zone_name?: string;
  leader?: string | null;
  status?: boolean;
}
