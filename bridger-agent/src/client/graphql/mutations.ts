import { gql } from "@apollo/client";

export const CATEGORIZE_TRANSACTION = gql`
  mutation CategorizeTransaction(
    $transactionId: ID!
    $status: CategorizationStatus!
    $categoryId: ID
    $payee: String
    $reason: String
  ) {
    categorizeTransaction(
      transactionId: $transactionId
      status: $status
      categoryId: $categoryId
      payee: $payee
      reason: $reason
    ) {
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

export const UPDATE_CLIENT_CONFIG = gql`
  mutation UpdateClientConfig($bankAccountId: ID!, $config: String!) {
    updateClientConfig(bankAccountId: $bankAccountId, config: $config) {
      id
      config
      bankAccountId
    }
  }
`;
