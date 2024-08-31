import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { UserAuthSupportService } from "./UserAuthService"

type OperationMethod = {
  resource: cdk.aws_apigateway.Resource
  httpMethod: string
  lambda: lambda.IFunction
}

export class RestApiService extends Construct {
  public restApi: apigateway.RestApi

  public apiResource: apigateway.Resource

  public authorizer: apigateway.CognitoUserPoolsAuthorizer | undefined

  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id)

    // Create the API Gateway
    this.restApi = new apigateway.RestApi(this, "OperationsApi", {
      description: "Description",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "Authorization",
          "X-Amz-Security-Token",
        ],
        allowMethods: [
          "OPTIONS",
          "GET",
          "POST",
          "PUT",
          "PATCH",
          "DELETE",
          "HEAD",
        ],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    })

    // UserAuth Support
    const userAuth = new UserAuthSupportService(this, "UserAuthSupport", {})

    if (userAuth.userPool) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this.restApi,
        "Authorizer",
        {
          cognitoUserPools: [userAuth.userPool],
          authorizerName: "userPoolAuthorizer",
        }
      )
    }

    this.apiResource = this.restApi.root.addResource("api")
  }

  addMathOperationResource(resourceName: string) {
    return this.apiResource.addResource(resourceName)
  }

  addMathOperationMethodWithAuthorizer({
    resource,
    httpMethod,
    lambda,
  }: OperationMethod) {
    resource.addMethod(httpMethod, new apigateway.LambdaIntegration(lambda), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: this.authorizer,
    })
  }
}
