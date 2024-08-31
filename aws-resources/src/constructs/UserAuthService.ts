import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface IUserAuthSupportService extends cdk.StackProps {}

export class UserAuthSupportService extends Construct {
  userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props?: IUserAuthSupportService) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "OperationsUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "OperationsUserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: "OperationsUserPoolClient",
      generateSecret: false,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClient", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
