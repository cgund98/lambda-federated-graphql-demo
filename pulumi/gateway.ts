import * as apigateway from '@pulumi/aws-apigateway'
import * as aws from '@pulumi/aws'
import * as fs from 'fs'

import { execSync } from 'child_process'

import { services } from './constants'
import { graphletAPI, lambdaFn } from './graphlet'

/**
 * Bit of a hacky way to generate router.json files at runtime.
 * This takes the API route for the graphlets and creates a compose.yaml that Cosmos will use
 * to create a router.json file.
 */
export const createRouterJson = (url: string) => {
  // Create compose.yaml
  let template = `
    version: 1
    subgraphs:
    `
  template += services
    .map(
      svc => `
    - name: ${svc}
      routing_url: ${url}${svc}
      schema:
        file: ../../src/api/${svc}/schema.v1.graphql
    `,
    )
    .join('\n')

  // Write compose.yaml
  fs.writeFileSync('../dist/router/compose.yaml', template)

  // Convert compose.yaml into router.json
  execSync(
    'wgc router compose -i ../dist/router/compose.yaml -o ../dist/router/router.json',
  )
}

const routerLambda = graphletAPI.url.apply(async url => {
  createRouterJson(url)

  return lambdaFn(
    'routerLambda',
    '../dist/router',
    'bootstrap',
    aws.lambda.Runtime.CustomAL2023,
    {
      GRAPH_API_TOKEN: '',
      STAGE: 'v1',
      DEV_MODE: 'false',
    },
  )
})

export const gatewayAPI = new apigateway.RestAPI('gatewayAPI', {
  routes: [
    // UI
    { path: '/', method: 'POST', eventHandler: routerLambda },
    { path: '/', method: 'GET', eventHandler: routerLambda },

    // API
    { path: '/graphql', method: 'POST', eventHandler: routerLambda },
    { path: '/graphql', method: 'GET', eventHandler: routerLambda },
  ],
  stageName: 'v1',
})
