import { Zone } from '../zone/zone.types';

export interface ResidentProfile {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  age: number;
  email: string | null;
  status: string;
  zone_id: string | null;
  zone?: Zone | null;
  created_at: string;
  updated_at: string;
}
