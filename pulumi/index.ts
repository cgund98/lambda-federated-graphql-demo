import * as pulumi from '@pulumi/pulumi'
import * as archive from '@pulumi/archive'
import * as aws from '@pulumi/aws'
import * as apigateway from '@pulumi/aws-apigateway'
import { createHash } from 'crypto'

// A Lambda function to invoke
const dateFn = new aws.lambda.CallbackFunction('dateFn', {
  callback: async (ev, ctx) => {
    return {
      statusCode: 200,
      body: new Date().toISOString(),
    }
  },
})

const assumeRole = aws.iam.getPolicyDocument({
  statements: [
    {
      effect: 'Allow',
      principals: [
        {
          type: 'Service',
          identifiers: ['lambda.amazonaws.com'],
        },
      ],
      actions: ['sts:AssumeRole'],
    },
  ],
})

const iamForLambda = new aws.iam.Role('iamForLambda', {
  assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
  ],
})

const hashPath = (path: string) =>
  createHash('sha256').update(path).digest('hex')

const lambdaFn = (name: string, path: string) => {
  const zipOutput = `./dist/${hashPath(path)}.zip`
  const zip = archive.getFile({
    type: 'zip',
    sourceDir: path,
    outputPath: zipOutput,
  })
  const lambdaFn = new aws.lambda.Function(name, {
    code: new pulumi.asset.FileArchive(zipOutput),
    handler: 'service.handler',
    role: iamForLambda.arn,
    sourceCodeHash: zip.then(zip => zip.outputBase64sha256),
    runtime: aws.lambda.Runtime.NodeJS18dX,
  })

  return lambdaFn
}

const basicLambda = lambdaFn('basicLambda', '../dist/basic')
const bookLambda = lambdaFn('bookLambda', '../dist/book')
const libraryLambda = lambdaFn('libraryLambda', '../dist/library')

// A REST API to route requests to HTML content and the Lambda function
const api = new apigateway.RestAPI('api', {
  routes: [
    { path: '/date', method: 'GET', eventHandler: dateFn },
    { path: '/graph', method: 'POST', eventHandler: basicLambda },
    { path: '/book', method: 'POST', eventHandler: bookLambda },
    { path: '/library', method: 'POST', eventHandler: libraryLambda },
    { path: '/graph', method: 'GET', eventHandler: basicLambda },
    { path: '/book', method: 'GET', eventHandler: bookLambda },
    { path: '/library', method: 'GET', eventHandler: libraryLambda },
  ],
})

// The URL at which the REST API will be served.
export const url = api.url
