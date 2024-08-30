import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { UserAuthSupportService } from "./UserAuthService";

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
      sortKey: { name: "time", type: dynamoDb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamoDb.BillingMode.PAY_PER_REQUEST,
      maxReadRequestUnits: 5,
      maxWriteRequestUnits: 5,
    });

    // Lambda Function for addition operation
    const additionFunction = new lambdaNodeJs.NodejsFunction(this, "AdditionFunction", {
      entry: "./lambda/addition.ts",
      handler: "index",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        OPERATIONS_TABLE: operationsTable.tableName,
        RECORDS_TABLE: recordsTable.tableName,
      },
    });

    // Lambda Function for subtract operation
    const subtractFunction = new lambdaNodeJs.NodejsFunction(
      this,
      "SubtractFunction",
      {
        entry: "./lambda/subtract.ts",
        handler: "index",
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          OPERATIONS_TABLE: operationsTable.tableName,
          RECORDS_TABLE: recordsTable.tableName,
        },
      }
    );

    // Grant read and write access to the Dynamo tables
    operationsTable.grantReadData(additionFunction);
    recordsTable.grantReadWriteData(additionFunction);

    operationsTable.grantReadData(subtractFunction);
    recordsTable.grantReadWriteData(subtractFunction);

    // Create the API Gateway
    const restApi = new apigateway.RestApi(this, "OperationsApi");

    // UserAuth Support
    const userAuth = new UserAuthSupportService(this, "UserAuthSupport", {});

    let authorizer: apigateway.CognitoUserPoolsAuthorizer | undefined;

    if (userAuth.userPool) {
      authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        restApi,
        "Authorizer",
        {
          cognitoUserPools: [userAuth.userPool],
          authorizerName: "userPoolAuthorizer",
        }
      );
    }

    // Create the 'api' resource
    const apiResource = restApi.root.addResource("api");

    // Create the 'addition' resource
    const additionResource = apiResource.addResource("addition");
    additionResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(additionFunction),
      {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: authorizer,
      }
    );
    // Add OPTIONS method to 'addition' resource
    additionResource.addMethod("OPTIONS", new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,POST'",
          "method.response.header.Access-Control-Allow-Origin": "'*'"
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}'
      },
    }), {
      methodResponses: [{
        statusCode: "200",
        responseParameters: {
          "method.response.header.Access-Control-Allow-Headers": true,
          "method.response.header.Access-Control-Allow-Methods": true,
          "method.response.header.Access-Control-Allow-Origin": true
        },
      }],
    });

    // Create the 'subtract' resource
    const subtractResource = apiResource.addResource("subtract");
    subtractResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(subtractFunction),
      {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: authorizer,
      }
    );

    // Define deployments for each stage
    const devDeployment = new apigateway.Deployment(this, "DevDeployment", {
      api: restApi,
      description: "Development deployment",
    });

    // Define stages for each deployment
    const devStage = new apigateway.Stage(this, "DevStage", {
      deployment: devDeployment,
      stageName: "dev",
      description: "Development stage",
    });

    restApi.deploymentStage = devStage;
  }
}
