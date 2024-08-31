import * as lambda from "aws-lambda";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

type Operation = {
  type: string;
  cost: number;
};

type Record = {
  id: string;
  operation: string;
  userId: number;
  amount: number;
  userBalance: number;
  operationResponse: number;
  date: number;
}

const {
  OPERATIONS_TABLE,
  RECORDS_TABLE,
} = process.env;

if (!OPERATIONS_TABLE || !RECORDS_TABLE) {
  throw new Error("Missing dynamodb environment variables");
}

const dynamoDbClient = new dynamodb.DynamoDBClient({});

export const subtract = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  const OPERATION_TYPE = "subtraction";

  try {
    if (!event.body) {
      return {
        statusCode: 400,
      };
    }

    const values =
      (JSON.parse(event.body) as { values?: number[] })?.values || [];

    if (values.length === 0) {
      return {
        statusCode: 400,
      };
    }

    const operationResult = values.reduce((acc, value) => {
      return acc - value;
    });

    const command = new dynamodb.GetItemCommand({
      TableName: OPERATIONS_TABLE,
      Key: {
        type: {
          S: OPERATION_TYPE,
        },
      },
    });

    const response = await dynamoDbClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        message: "Operation not found",
      };
    }

    const operation = unmarshall(response.Item) as Operation;

    // TODO: Manage the credits
    const userCredits = 10;

    const operationRecord: Record = {
      id: context.awsRequestId,
      operation: operation.type,
      userId: 14,
      amount: operation.cost,
      userBalance: userCredits - operation.cost,
      operationResponse: operationResult,
      date: Date.now(),
    };

    const recordCommand = new dynamodb.PutItemCommand({
      TableName: RECORDS_TABLE,
      Item: marshall(operationRecord),
    });

    await dynamoDbClient.send(recordCommand);

    return {
      statusCode: 200,
      body: JSON.stringify(operationRecord),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};
