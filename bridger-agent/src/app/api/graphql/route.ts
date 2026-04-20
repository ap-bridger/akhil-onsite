import { greetings } from "@/server/modules/greet/api";
import {
  categorizeTransaction,
  transactions,
} from "@/server/modules/transaction/api";
import { bankAccounts } from "@/server/modules/bank-account/api";
import { vendors } from "@/server/modules/vendor/api";
import { categories } from "@/server/modules/category/api";
import {
  clientConfigs,
  updateClientConfig,
} from "@/server/modules/client-config/api";
import { createSchema, createYoga } from "graphql-yoga";

const { handleRequest } = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Vendor {
        id: ID!
        name: String!
      }

      type Category {
        id: ID!
        name: String!
      }

      enum CategorizationStatus {
        NEEDS_REVIEW
        NEEDS_MORE_INFO
        REVIEWED
      }

      type Categorization {
        id: ID!
        reason: String!
        aiGenerated: Boolean!
        status: CategorizationStatus!
        confidenceScore: Int!
        createdAt: String!
        payee: Vendor
        category: Category
      }

      type Transaction {
        id: ID!
        details: String!
        amount: Float!
        transactionDate: String!
        bankAccountId: ID!
        categorization: Categorization
      }

      type BankAccount {
        id: ID!
        name: String!
        accountNumber: String!
        clientId: ID!
      }

      type ClientConfig {
        id: ID!
        config: String!
        bankAccountId: ID!
      }

      type Query {
        greetings: String
        transactions(bankAccountId: ID!): [Transaction!]!
        bankAccounts: [BankAccount!]!
        vendors: [Vendor!]!
        categories: [Category!]!
        clientConfigs(bankAccountId: ID!): [ClientConfig!]!
      }

      type Mutation {
        categorizeTransaction(
          transactionId: ID!
          status: CategorizationStatus!
          categoryId: ID
          payee: String
          reason: String
        ): Transaction!

        updateClientConfig(
          bankAccountId: ID!
          config: String!
        ): ClientConfig!
      }
    `,
    resolvers: {
      Query: {
        greetings,
        transactions,
        bankAccounts,
        vendors,
        categories,
        clientConfigs,
      },
      Mutation: {
        categorizeTransaction,
        updateClientConfig,
      },
    },
  }),

  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
