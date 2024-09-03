import * as lambda from "aws-lambda"
import * as dynamodb from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"
import { CustomResponse } from "../classes/Operation"

const { OPERATIONS_TABLE } = process.env

if (!OPERATIONS_TABLE) {
  throw new Error("Missing dynamodb environment variables")
}

const dynamoDbClient = new dynamodb.DynamoDBClient({})

export const getHistory = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    // const email = event.queryStringParameters?.email
    const email = "cmburboa@gmail.com"
    const sort = event.queryStringParameters?.sort

    const scanPromises = []
    const totalSegments = 4

    for (let segment = 0; segment < totalSegments; segment++) {
      const scanParams: dynamodb.ScanCommandInput = {
        TableName: OPERATIONS_TABLE,
        Segment: segment,
        TotalSegments: totalSegments,
        FilterExpression: "#pk = :email AND #sk > :sk",
        ExpressionAttributeNames: {
          "#pk": "pk",
          "#sk": "sk",
        },
        ExpressionAttributeValues: {
          ":email": { S: email },
          ":sk": { N: "2" },
        },
      }

      const scanCommand = new dynamodb.ScanCommand(scanParams)
      scanPromises.push(dynamoDbClient.send(scanCommand))
    }

    // Execute all scan commands in parallel
    const responses = await Promise.all(scanPromises)

    // Combine results from all segments
    const combinedItems = responses.flatMap((response) => response.Items || [])

    if (!combinedItems) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      }
    }

    // Unmarshall results
    const records = combinedItems.map((item) => unmarshall(item))

    // Sort results
    if (sort?.toUpperCase() === "ASC") {
      records.sort((a, b) => a.sk - b.sk)
    } else {
      records.sort((a, b) => b.sk - a.sk)
    }

    const formattedRecords = records.map((item) => ({
      type: item.details.operation_type,
      user_balance: item.details.user_balance,
      result: item.details?.amount ?? item.details?.string?.stringsGenerated,
      date: new Date(item.sk).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }))

    return new CustomResponse(200, { records: formattedRecords })
  } catch (e) {
    return new CustomResponse(500, { message: (e as Error).message })
  }
}
