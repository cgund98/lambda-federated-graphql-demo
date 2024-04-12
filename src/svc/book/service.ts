import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { readFileSync } from 'fs'
import gql from 'graphql-tag'

import { books } from './data'
import { Context } from './context'
import { Resolvers } from './__generated__/resolvers-types'

const typeDefs = gql(readFileSync('schema.v1.graphql', { encoding: 'utf-8' }))

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
    __resolveReference: ({ id }, { dataSources }) => {
      const result = dataSources.books.find(book => book.id === id)

      if (!result) throw new Error('No matching book found.')

      return result
    },
  },
  Library: {
    books: ({ id }, _, { dataSources }) => {
      return dataSources.books.filter(book => book.libraryID === id)
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
    // eslint-disable-next-line @typescript-eslint/require-await
    context: async () => {
      return {
        dataSources: { books },
      }
    },
  },
)
