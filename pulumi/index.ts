import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

// A Lambda function to invoke
const dateFn = new aws.lambda.CallbackFunction("dateFn", {
    callback: async (ev, ctx) => {
        return {
            statusCode: 200,
            body: new Date().toISOString(),
        };
    }
})

const assumeRole = aws.iam.getPolicyDocument({
    statements: [{
        effect: "Allow",
        principals: [{
            type: "Service",
            identifiers: ["lambda.amazonaws.com"],
        }],
        actions: ["sts:AssumeRole"],
    }],
});

const iamForLambda = new aws.iam.Role("iamForLambda", {
    assumeRolePolicy: assumeRole.then(assumeRole => assumeRole.json),
    managedPolicyArns: [
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    ],
});

const graphLambda = new aws.lambda.Function("graphLambda", {
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("../dist/basic"),
    }),
    handler: "service.handler",
    role: iamForLambda.arn,
    runtime: aws.lambda.Runtime.NodeJS18dX,
});

// A REST API to route requests to HTML content and the Lambda function
const api = new apigateway.RestAPI("api", {
    routes: [
        { path: "/date", method: "GET", eventHandler: dateFn },
        { path: "/graph", method: "GET", eventHandler: graphLambda },
        { path: "/graph", method: "POST", eventHandler: graphLambda },
    ]
});

// The URL at which the REST API will be served.
export const url = api.url;
