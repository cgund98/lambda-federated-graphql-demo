import * as apigateway from '@pulumi/aws-apigateway'
import * as pulumi from '@pulumi/pulumi'
import * as archive from '@pulumi/archive'
import * as aws from '@pulumi/aws'
import { createHash } from 'crypto'

import { iamForLambda } from './iam'

const hashPath = (path: string) =>
  createHash('sha256').update(path).digest('hex')

export const lambdaFn = (
  name: string,
  path: string,
  handler: string = 'service.handler',
  runtime: aws.lambda.Runtime = aws.lambda.Runtime.NodeJS18dX,
) => {
  const zipOutput = `./dist/${hashPath(path)}.zip`
  const zip = archive.getFile({
    type: 'zip',
    sourceDir: path,
    outputPath: zipOutput,
  })
  const lambdaFn = new aws.lambda.Function(name, {
    code: new pulumi.asset.FileArchive(zipOutput),
    handler,
    role: iamForLambda.arn,
    sourceCodeHash: zip.then(zip => zip.outputBase64sha256),
    runtime,
    environment: {
      variables: {
        GRAPH_API_TOKEN: '',
        STAGE: 'v1',
        DEV_MODE: 'false',
      },
    },
  })

  return lambdaFn
}

const basicLambda = lambdaFn('basicLambda', '../dist/basic')
const bookLambda = lambdaFn('bookLambda', '../dist/book')
const libraryLambda = lambdaFn('libraryLambda', '../dist/library')

// A REST API to route requests to HTML content and the Lambda function
export const graphletAPI = new apigateway.RestAPI('graphletAPI', {
  routes: [
    { path: '/graph', method: 'POST', eventHandler: basicLambda },
    { path: '/graph', method: 'GET', eventHandler: basicLambda },

    { path: '/library', method: 'POST', eventHandler: libraryLambda },
    { path: '/library', method: 'GET', eventHandler: libraryLambda },

    { path: '/book', method: 'POST', eventHandler: bookLambda },
    { path: '/book', method: 'GET', eventHandler: bookLambda },
  ],
  stageName: 'v1',
})
