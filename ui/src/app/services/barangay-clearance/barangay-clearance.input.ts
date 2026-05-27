export interface CreateBarangayClearanceInput {
  resident_id: string;
  purpose: string;
  issued_on: string;
  valid_until: string;
  status?: string;
}

export interface UpdateBarangayClearanceInput {
  id: string;
  purpose?: string;
  valid_until?: string;
  status?: string;
}
