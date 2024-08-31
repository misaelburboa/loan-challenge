import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

import { RestApiService } from "../constructs";
import { MathOperationsService } from "../constructs/MathOperationsService";

export class MathOperationsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = path.resolve(__dirname, '../')
    const lambdasDirPath = path.join(projectRoot, "lambda");

    new MathOperationsService(this, "MathOperationsService", {
      lambdaDirectoryPath: lambdasDirPath,
    })
  }
}
