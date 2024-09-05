import { Construct } from "constructs"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as cdk from "aws-cdk-lib"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as lambda from "aws-cdk-lib/aws-lambda"

export interface WebsiteServiceInterface extends cdk.StackProps {}

export class WebsiteService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const edgeFunction = new lambda.Function(this, "NextRouter", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.edgeNextRouter",
      code: lambda.Code.fromAsset("./src/lambda/edge-next-router"), // Path to the directory with Lambda code
    })

    const distro = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteCloud",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },

            behaviors: [
              {
                isDefaultBehavior: true,
                lambdaFunctionAssociations: [
                  {
                    eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                    lambdaFunction: edgeFunction.currentVersion,
                  },
                ],
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
          },
        ],
      }
    )

    // S3 construct to the deploy the website
    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../operations-app/dist")],
      distribution: distro,
      distributionPaths: ["/*"],
    })

    new cdk.CfnOutput(this, "webUrl", {
      exportName: "webUrl",
      value: `https://${distro.distributionDomainName}`,
    })
  }
}
