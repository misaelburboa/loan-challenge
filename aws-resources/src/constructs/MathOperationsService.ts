import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as path from "path"
import { RestApiService } from "./RestApiServie"

export interface MathOperationsServiceInterface extends cdk.StackProps {
  lambdaDirectoryPath: string
}

export class MathOperationsService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { lambdaDirectoryPath }: MathOperationsServiceInterface
  ) {
    super(scope, id)

    // DynamoDB Tables
    const operationsTable = new dynamoDb.Table(this, "MathOperations", {
      tableName: "MathOperations",
      partitionKey: { name: "pk", type: dynamoDb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamoDb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      maxReadRequestUnits: 5,
      maxWriteRequestUnits: 5,
    })

    // Lambda Function for addition operation
    const additionFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "AdditionFunction",
      {
        entry: path.join(lambdaDirectoryPath, "addition.ts"),
        handler: "addition",
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
        },
      }
    )

    // Lambda Function for subtract operation
    const subtractFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "SubtractFunction",
      {
        entry: path.join(lambdaDirectoryPath, "subtract.ts"),
        handler: "subtract",
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
        },
      }
    )

    // Grant read and write access to the Dynamo tables
    operationsTable.grantReadWriteData(additionFunction)
    operationsTable.grantReadWriteData(subtractFunction)

    const restApi = new RestApiService(this, "RestApiService")

    // Addition API GW Resource
    const additionResource = restApi.addMathOperationResource("addition")
    restApi.addMathOperationMethod({
      resource: additionResource,
      httpMethod: "POST",
      lambda: additionFunction,
      needsAuthorizer: true
    })

    // Substract API GW Resource
    const subtractResource = restApi.addMathOperationResource("subtract")
    restApi.addMathOperationMethod({
      resource: subtractResource,
      httpMethod: "POST",
      lambda: subtractFunction,
      needsAuthorizer: true
    })
  }
}
