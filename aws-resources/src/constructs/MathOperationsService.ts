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

    const DEFAULT_LAMBDA_TIMEOUT = 10;

    // Lambda Function for addition operation
    const additionFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "AdditionFunction",
      {
        entry: path.join(lambdaDirectoryPath, "addition.ts"),
        handler: "addition",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT),
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
        },
      }
    )

    // Lambda Function for subtraction operation
    const subtractionFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "SubtractionFunction",
      {
        entry: path.join(lambdaDirectoryPath, "subtraction.ts"),
        handler: "subtraction",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT),
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
        },
      }
    )

    // Lambda Function for multiply operation
    const multiplicationFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "MultiplicationFunction",
      {
        entry: path.join(lambdaDirectoryPath, "multiplication.ts"),
        handler: "multiplication",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT),
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
        },
      }
    )

    // Lambda Function for random string operation
    const randomStringFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "RandomStringFunction",
      {
        entry: path.join(lambdaDirectoryPath, "random-string.ts"),
        handler: "randomString",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(DEFAULT_LAMBDA_TIMEOUT),
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
          // This should be appended in some CI/CD process, but for the sake of the example is ok
          RANDOM_STRING_API_KEY: "df5ca201-d5d2-4e01-ad75-89fcd049a38f",
          RANDOM_STRING_API_ENDPOINT:
            "https://api.random.org/json-rpc/4/invoke",
        },
      }
    )

    // Grant read and write access to the Dynamo tables
    operationsTable.grantReadWriteData(additionFunction)
    operationsTable.grantReadWriteData(subtractionFunction)
    operationsTable.grantReadWriteData(multiplicationFunction)
    operationsTable.grantReadWriteData(randomStringFunction)

    const restApi = new RestApiService(this, "RestApiService")

    // Addition API GW Resource
    const additionResource = restApi.addMathOperationResource("addition")
    restApi.addMathOperationMethod({
      resource: additionResource,
      httpMethod: "POST",
      lambda: additionFunction,
      needsAuthorizer: true,
    })

    // Substract API GW Resource
    const subtractionResource = restApi.addMathOperationResource("subtraction")
    restApi.addMathOperationMethod({
      resource: subtractionResource,
      httpMethod: "POST",
      lambda: subtractionFunction,
      needsAuthorizer: true,
    })

    // Multiplication API GW Resource
    const multiplyResource = restApi.addMathOperationResource("multiplication")
    restApi.addMathOperationMethod({
      resource: multiplyResource,
      httpMethod: "POST",
      lambda: multiplicationFunction,
      needsAuthorizer: true,
    })

    // Random Str API GW Resource
    const randomStrResource = restApi.addMathOperationResource("random-str")
    restApi.addMathOperationMethod({
      resource: randomStrResource,
      httpMethod: "POST",
      lambda: randomStringFunction,
      needsAuthorizer: true,
    })
  }
}
