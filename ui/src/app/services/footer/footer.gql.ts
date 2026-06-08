export const GET_FOOTERS = `
  query GetFooters {
    footers {
      id
      name
      copyright
      address
      phone
      email
      status
    }
  }
`;

export const CREATE_FOOTER = `
  mutation CreateFooter($input: CreateFooterInput!) {
    createFooter(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_FOOTER = `
  mutation UpdateFooter($input: UpdateFooterInput!) {
    updateFooter(input: $input) {
      id
      name
    }
  }
`;

export const DELETE_FOOTER = `
  mutation DeleteFooter($id: ID!) {
    deleteFooter(id: $id) {
      id
    }
  }
`;

export const GET_ACTIVE_FOOTER = `
  query GetActiveFooter {
    activeFooter {
      copyright
      address
      phone
      email
    }
  }
`;

