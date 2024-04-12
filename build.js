const { build } = require('esbuild')
const copyStaticFiles = require('esbuild-copy-static-files')

const sharedConfig = {
  bundle: true,
  minify: true,
}

build({
  ...sharedConfig,
  entryPoints: ['src/svc/basic.ts'],
  platform: 'node',
  outfile: 'dist/basic/service.js',
  sourcemap: 'inline',
})

/**
 * Bundle GraphQL services
 */
const buildLambda = name =>
  build({
    // Bundle code
    bundle: true,
    minify: true,
    entryPoints: [`src/svc/${name}/service.ts`],
    platform: 'node',
    outfile: `dist/${name}/service.js`,
    sourcemap: 'inline',

    // Copy schema.graphql
    plugins: [
      copyStaticFiles({
        src: `./src/api/${name}`,
        dest: `dist/${name}`,
      }),
    ],
  })

buildLambda('book')
buildLambda('library')
