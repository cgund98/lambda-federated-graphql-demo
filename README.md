# lambda-federated-graphql-demo
![image](https://github.com/cgund98/lambda-federated-graphql-demo/assets/17605568/bbb41ec3-275a-4abd-ae08-c7501f7e400f)

This repo is a simple demonstration of how you might deploy a federated GraphQL service to AWS Lambda using Pulumi.

There are two "graphlet" microservices that focus on two distinct entities:
- Book
- Library

Each graphlet runs in its own Lambda function, as does the Cosmo Router. 

## Installation

### Prequisites

- _Node_: `brew install node`
- _Pulumi_: `brew install pulumi/tap/pulumi`
- _Cosmo (wgc)_ `npm install -g wgc@latest`

### Optional Tools

- _pre-commit_: `brew install pre-commit`

### Install NPM dependencies

```bash
make install
```

### Deploy

```bash
make build
make deploy
```
