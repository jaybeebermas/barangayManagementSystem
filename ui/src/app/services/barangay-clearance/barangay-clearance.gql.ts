export const GET_BARANGAY_CLEARANCES = `
  query GetBarangayClearances {
    barangayClearances {
      id
      clearance_number
      resident_id
      resident {
        id
        first_name
        last_name
        birthdate
        age
        email
        status
        zone_id
        zone {
          id
          zone_name
        }
      }
      issued_by
      issuer {
        id
        first_name
        last_name
        role
      }
      purpose
      issued_on
      valid_until
      status
      created_at
      updated_at
    }
  }
`;

export const GET_BARANGAY_CLEARANCE = `
  query GetBarangayClearance($id: ID!) {
    barangayClearance(id: $id) {
      id
      clearance_number
      resident_id
      resident {
        id
        first_name
        last_name
        birthdate
        age
        email
        status
        zone_id
        zone {
          id
          zone_name
        }
      }
      issued_by
      issuer {
        id
        first_name
        last_name
        role
      }
      purpose
      issued_on
      valid_until
      status
      created_at
      updated_at
    }
  }
`;

export const CREATE_BARANGAY_CLEARANCE = `
  mutation CreateBarangayClearance($input: CreateBarangayClearanceInput!) {
    createBarangayClearance(input: $input) {
      id
      clearance_number
      resident_id
      resident {
        id
        first_name
        last_name
      }
      issued_by
      issuer {
        id
        first_name
        last_name
        role
      }
      purpose
      issued_on
      valid_until
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_BARANGAY_CLEARANCE = `
  mutation UpdateBarangayClearance($input: UpdateBarangayClearanceInput!) {
    updateBarangayClearance(input: $input) {
      id
      clearance_number
      resident_id
      resident {
        id
        first_name
        last_name
      }
      issued_by
      issuer {
        id
        first_name
        last_name
        role
      }
      purpose
      issued_on
      valid_until
      status
      created_at
      updated_at
    }
  }
`;

export const DELETE_BARANGAY_CLEARANCE = `
  mutation DeleteBarangayClearance($id: ID!) {
    deleteBarangayClearance(id: $id) {
      id
      clearance_number
    }
  }
`;

export const GENERATE_BARANGAY_CLEARANCE_PDF = `
  mutation GenerateBarangayClearancePdf($id: ID!) {
    generateBarangayClearancePdf(id: $id)
  }
`;
