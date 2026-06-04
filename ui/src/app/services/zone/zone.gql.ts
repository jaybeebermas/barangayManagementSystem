export const GET_ZONES = `
  query GetZones {
    zones {
      id
      zone_code
      zone_name
      leader
      status
      created_at
      updated_at
    }
  }
`;

export const GET_ZONE = `
  query GetZone($id: ID!) {
    zone(id: $id) {
      id
      zone_code
      zone_name
      leader
      status
      created_at
      updated_at
    }
  }
`;

export const CREATE_ZONE = `
  mutation CreateZone($input: CreateZoneInput!) {
    createZone(input: $input) {
      id
      zone_code
      zone_name
      leader
      status
      created_at
      updated_at
    }
  }
`;

export const UPDATE_ZONE = `
  mutation UpdateZone($input: UpdateZoneInput!) {
    updateZone(input: $input) {
      id
      zone_code
      zone_name
      leader
      status
      created_at
      updated_at
    }
  }
`;

export const DELETE_ZONE = `
  mutation DeleteZone($id: ID!) {
    deleteZone(id: $id) {
      id
      zone_code
      zone_name
      leader
      status
      created_at
      updated_at
    }
  }
`;
