import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { readFileSync } from 'fs'
import gql from 'graphql-tag'

import { Book, books } from './data'
import { Resolvers } from './__generated__/resolvers-types'

const typeDefs = gql(readFileSync('schema.v1.graphql', { encoding: 'utf-8' }))

interface Context {
  dataSources: {
    books: Book[]
  }
}

const resolvers: Resolvers = {
  Query: {
    books: () => {
      return books
    },
    book: (_, { id }) => {
      const result = books.find(book => book.id === id)

      if (!result) throw new Error('Unable to find book.')

      return result
    },
  },
  Book: {
    __resolveReference(book) {
      return book
    },
  },
}

const server = new ApolloServer<Context>({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
})

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
  {
    context: async () => {
      return {
        dataSources: { books },
      }
    },
  },
)
