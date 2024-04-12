import { CodegenConfig } from '@graphql-codegen/cli'

const plugins = ['typescript', 'typescript-resolvers']
const commonConfig = {
  useIndexSignature: true,
}

// Iterate over each service
const services = ['library', 'book']

const config: CodegenConfig = {
  generates: services.reduce((obj, cur) => {
    const dest = `./src/svc/${cur}/__generated__/resolvers-types.ts`
    const schema = `./src/api/${cur}/schema.v1.graphql`
    const contextType = `./src/svc/${cur}/service#Context`

    obj[dest] = {
      schema,
      plugins,
      config: { ...commonConfig, contextType },
    }

    return obj
  }, {}),
}
export default config
