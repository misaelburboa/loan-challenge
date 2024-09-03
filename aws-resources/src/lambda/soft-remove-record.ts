import * as dynamodb from "@aws-sdk/client-dynamodb"
import * as lambda from "aws-lambda"
import {
  CustomResponse,
  NotFoundException,
  PreconditionException,
  type RecordItem,
} from "../classes/Operation"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

const dynamoDbClient = new dynamodb.DynamoDBClient({})

export const softRemoveRecords = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (
      !event?.queryStringParameters?.email ||
      !event?.queryStringParameters?.timestamp
    ) {
      return new PreconditionException("Incorrect params provided")
    }

    const email = event.queryStringParameters.email
    const timestamp = event.queryStringParameters.timestamp

    const key = marshall({
      pk: email,
      sk: parseInt(timestamp, 10),
    })

    try {
      const command = new dynamodb.GetItemCommand({
        TableName: process.env.OPERATIONS_TABLE,
        Key: key,
      })

      const response = await dynamoDbClient.send(command)

      if (!response.Item) {
        throw new NotFoundException("User not found")
      }

      const record = unmarshall(response.Item) as RecordItem

      const updateCommand = new dynamodb.UpdateItemCommand({
        TableName: process.env.OPERATIONS_TABLE,
        Key: key,
        UpdateExpression: "SET #details = :details",
        ExpressionAttributeNames: { "#details": "details" },
        ExpressionAttributeValues: {
          ":details": {
            M: marshall({ ...record.details, removed: true }),
          },
        },
        ReturnValues: "ALL_NEW",
      })

      await dynamoDbClient.send(updateCommand)
    } catch (error) {
      throw error
    }

    return new CustomResponse(200, { message: "Record removed correctly" })
  } catch (e) {
    if (e instanceof PreconditionException) {
      return new CustomResponse(PreconditionException.NUMBER_CODE, {
        message: e.message,
      })
    }

    if (e instanceof NotFoundException) {
      return new CustomResponse(NotFoundException.NUMBER_CODE, {
        message: e.message,
      })
    }

    return new CustomResponse(500, { message: (e as Error).message })
  }
}
