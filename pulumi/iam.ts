import * as aws from '@pulumi/aws'

// A Lambda function to invoke
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

export const iamForLambda = new aws.iam.Role('iamForLambda', {
  assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
  ],
})
