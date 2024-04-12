import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { readFileSync } from 'fs'
import gql from 'graphql-tag'

import { libraries } from './data'
import { Resolvers } from './__generated__/resolvers-types'
import { Context } from './context'

const typeDefs = gql(readFileSync('schema.v1.graphql', { encoding: 'utf-8' }))

const resolvers: Resolvers = {
  Query: {
    libraries: () => {
      return libraries
    },
    library: (_, { id }, { dataSources }) => {
      const result = dataSources.libraries.find(library => library.id === id)

      if (!result) throw new Error('No matching library found.')

      return result
    },
  },
  Library: {
    __resolveReference: ({ id }, { dataSources }) => {
      const result = dataSources.libraries.find(library => library.id === id)

      if (!result) throw new Error('No matching library found.')

      return result
    },
  },
  Book: {
    library(book, _, { dataSources }) {
      const result = dataSources.libraries.find(
        library => library.id === book.libraryID,
      )

      if (!result) throw new Error('No matching library found.')

      return result
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
        dataSources: { libraries },
      }
    },
  },
)
