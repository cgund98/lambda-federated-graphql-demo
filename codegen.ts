import { CodegenConfig } from '@graphql-codegen/cli'

const plugins = ['typescript', 'typescript-resolvers']
const commonConfig = {
  useIndexSignature: true,
  federation: true,
}

// Iterate over each service
const services = ['library', 'book']

const config: CodegenConfig = {
  generates: services.reduce(
    (obj, cur) => {
      const dest = `./src/svc/${cur}/__generated__/resolvers-types.ts`
      const schema = `./src/api/${cur}/schema.v1.graphql`
      const contextType = `svc/${cur}/context#Context`

      const newObj = { ...obj }

      newObj[dest] = {
        schema,
        plugins,
        config: { ...commonConfig, contextType },
      }

      return newObj
    },
    {} as CodegenConfig['generates'],
  ),
}
export default config
