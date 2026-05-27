import { ResidentProfile } from '../resident-profile/resident-profile.types';

export interface BarangayClearanceIssuer {
  id: string;
  first_name: string;
  last_name: string;
  role?: string | null;
}

export interface BarangayClearance {
  id: string;
  clearance_number: string;
  resident_id: string;
  resident?: ResidentProfile | null;
  issued_by: string;
  issuer?: BarangayClearanceIssuer | null;
  purpose: string;
  issued_on: string;
  valid_until: string;
  status: string;
  created_at: string;
  updated_at: string;
}
