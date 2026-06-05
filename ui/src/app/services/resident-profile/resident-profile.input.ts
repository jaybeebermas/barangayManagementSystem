export interface CreateResidentProfileInput {
  first_name: string;
  last_name: string;
  birthdate: string;
  age: number;
  email?: string | null;
  status: string;
  zone_id?: string | null;
}

export interface UpdateResidentProfileInput {
  id: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  age?: number;
  email?: string | null;
  status?: string;
  zone_id?: string | null;
}
