import { ApolloServer } from '@apollo/server'
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { readFileSync } from 'fs'
import gql from 'graphql-tag'
import { libraries, Library } from './data'
import { Resolvers } from './__generated__/resolvers-types'

const typeDefs = gql(readFileSync('schema.v1.graphql', { encoding: 'utf-8' }))

interface Context {
  dataSources: {
    libraries: Library[]
  }
}

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
        dataSources: { libraries },
      }
    },
  },
)
