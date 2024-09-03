import * as lambda from "aws-lambda"
import * as dynamodb from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { CustomResponse, PreconditionException } from "../classes/Operation"

const { OPERATIONS_TABLE } = process.env

if (!OPERATIONS_TABLE) {
  throw new Error("Missing dynamodb environment variables")
}

const dynamoDbClient = new dynamodb.DynamoDBClient({})

type ExclusiveStartKeyType = {
  pk: { S: string }
  sk: { N: string }
}

export const getHistory = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    let email = event.queryStringParameters?.email

    if (!email) {
      throw new PreconditionException("Email not provided and it is required")
    }

    let lastEvaluatedKeyParam = event?.queryStringParameters?.lastEvaluated
    let limit = parseInt(event?.queryStringParameters?.limit || "10", 10)

    let lastEvaluatedKey: ExclusiveStartKeyType | undefined
    if (lastEvaluatedKeyParam) {
      lastEvaluatedKey = JSON.parse(decodeURIComponent(lastEvaluatedKeyParam))
    }

    const scanParams: dynamodb.ScanCommandInput = {
      TableName: OPERATIONS_TABLE,
      FilterExpression: "#pk = :email AND #sk > :sk",
      ExpressionAttributeNames: {
        "#pk": "pk",
        "#sk": "sk",
      },
      ExpressionAttributeValues: {
        ":email": { S: email },
        ":sk": { N: "2" },
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey ? lastEvaluatedKey : undefined,
    }

    const scanCommand = new dynamodb.ScanCommand(scanParams)
    const response: dynamodb.ScanCommandOutput = await dynamoDbClient.send(
      scanCommand
    )

    const items = response.Items || []
    const lastKey = response.LastEvaluatedKey

    const records = items.map((item) => unmarshall(item))

    const formattedRecords = records.map((item) => {
      console.log(item.details)
      const result = item.details?.amount
        ? item.details.amount
        : item.details?.stringsGenerated

      return {
        type: item.details.operation_type,
        user_balance: item.details.user_balance,
        result: result?.toString(),
        date: new Date(item.sk).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        timestamp: item.sk,
      }
    })

    return new CustomResponse(200, {
      records: formattedRecords,
      nextPage: lastKey ? encodeURIComponent(JSON.stringify(lastKey)) : null,
    })
  } catch (e) {
    return new CustomResponse(500, { message: (e as Error).message })
  }
}
