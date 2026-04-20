import { gql } from "@apollo/client";

export const GET_BANK_ACCOUNTS = gql`
  query GetBankAccounts {
    bankAccounts {
      id
      name
      accountNumber
      clientId
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($bankAccountId: ID!) {
    transactions(bankAccountId: $bankAccountId) {
      id
      details
      amount
      transactionDate
      bankAccountId
      categorization {
        id
        reason
        aiGenerated
        status
        confidenceScore
        createdAt
        payee {
          id
          name
        }
        category {
          id
          name
        }
      }
    }
  }
`;

export const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      name
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export const GET_CLIENT_CONFIGS = gql`
  query GetClientConfigs($bankAccountId: ID!) {
    clientConfigs(bankAccountId: $bankAccountId) {
      id
      config
      bankAccountId
    }
  }
`;
