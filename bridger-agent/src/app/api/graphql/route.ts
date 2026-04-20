import { greetings } from "@/server/modules/greet/api";
import {
  categorizeTransaction,
  transactions,
} from "@/server/modules/transaction/api";
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

      type Categorization {
        id: ID!
        reason: String!
        aiGenerated: Boolean!
        status: String!
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

      type Query {
        greetings: String
        transactions(bankAccountId: ID!): [Transaction!]!
      }

      enum CategorizeStatus {
        NEEDS_MORE_INFO
        REVIEWED
      }

      type Mutation {
        categorizeTransaction(
          transactionId: ID!
          status: CategorizeStatus!
          categoryId: ID
          payee: String
        ): Transaction!
      }
    `,
    resolvers: {
      Query: {
        greetings,
        transactions,
      },
      Mutation: {
        categorizeTransaction,
      },
    },
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
