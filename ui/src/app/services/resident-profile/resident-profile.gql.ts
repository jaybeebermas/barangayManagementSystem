export const GET_RESIDENT_PROFILES = `
  query GetResidentProfiles {
    residentProfiles {
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
        zone_code
        zone_name
      }
      created_at
      updated_at
    }
  }
`;

export const GET_RESIDENT_PROFILE = `
  query GetResidentProfile($id: ID!) {
    residentProfile(id: $id) {
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
        zone_code
        zone_name
      }
      created_at
      updated_at
    }
  }
`;

export const CREATE_RESIDENT_PROFILE = `
  mutation CreateResidentProfile($input: CreateResidentProfileInput!) {
    createResidentProfile(input: $input) {
      id
      first_name
      last_name
      birthdate
      age
      email
      status
      zone_id
      created_at
      updated_at
    }
  }
`;

export const UPDATE_RESIDENT_PROFILE = `
  mutation UpdateResidentProfile($input: UpdateResidentProfileInput!) {
    updateResidentProfile(input: $input) {
      id
      first_name
      last_name
      birthdate
      age
      email
      status
      zone_id
      created_at
      updated_at
    }
  }
`;

export const DELETE_RESIDENT_PROFILE = `
  mutation DeleteResidentProfile($id: ID!) {
    deleteResidentProfile(id: $id) {
      id
      first_name
      last_name
    }
  }
`;
