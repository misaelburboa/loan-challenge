import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class AwsResourcesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const operationsTable = new dynamoDb.Table(this, "OperationTable", {
      tableName: "operation",
      partitionKey: { name: "type", type: dynamoDb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      maxReadRequestUnits: 5,
      maxWriteRequestUnits: 5,
    });

    const recordsTable = new dynamoDb.Table(this, "RecordTable", {
      tableName: "record",
      partitionKey: { name: "id", type: dynamoDb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      maxReadRequestUnits: 5,
      maxWriteRequestUnits: 5,
    });

    // Lambda Function for add operation
    const addFunction = new lambdaNodeJs.NodejsFunction(this, "AddFunction", {
      entry: "./lambda/add.ts",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        OPERATIONS_TABLE: operationsTable.tableName,
        RECORDS_TABLE: recordsTable.tableName,
      },
    });

    // Lambda Function for subtract operation
    const subtractFunction = new lambdaNodeJs.NodejsFunction(this, "SubtractFunction", {
      entry: "./lambda/subtract.ts",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        OPERATIONS_TABLE: operationsTable.tableName,
        RECORDS_TABLE: recordsTable.tableName,
      },
    });

    // Grant read and write access to the Dynamo tables
    operationsTable.grantReadWriteData(addFunction);
    recordsTable.grantReadWriteData(addFunction);

    operationsTable.grantReadWriteData(subtractFunction);
    recordsTable.grantReadWriteData(subtractFunction);

    // Create the API Gateway
    const restApi = new apigateway.RestApi(this, "OperationsApi");

    // Create the 'operations' resource
    const operationsResource = restApi.root.addResource("operations");

    // Create the 'add' resource
    const addResouce = operationsResource.addResource("add");
    addResouce.addMethod("POST", new apigateway.LambdaIntegration(addFunction), {});

    // Create the 'subtract' resource
    const subtractResource = operationsResource.addResource("subtract");
    subtractResource.addMethod("POST", new apigateway.LambdaIntegration(subtractFunction), {});
  }
}
