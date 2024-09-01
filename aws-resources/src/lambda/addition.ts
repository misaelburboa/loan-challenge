import * as lambda from "aws-lambda"
import * as dynamodb from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

class PreconditionException extends Error {
  static NUMBER_CODE = 412

  public statusCode: number
  public message: string

  constructor(message: string) {
    super(message)
    this.name = "NotFoundException"
    this.statusCode = 412
    this.message = message
    Object.setPrototypeOf(this, PreconditionException.prototype)
  }
}

class NotFoundException extends Error {
  static NUMBER_CODE = 404

  public statusCode: number
  public message: string

  constructor(message: string) {
    super(message)
    this.name = "NotFoundException"
    this.statusCode = 404
    this.message = message
    Object.setPrototypeOf(this, NotFoundException.prototype)
  }
}

class CustomResponse {
  public statusCode
  public body
  public headers

  constructor(
    statusCode: number,
    body?: object,
    headers?: Record<string, string>
  ) {
    this.statusCode = statusCode
    this.body = JSON.stringify(body)
    this.headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Controll-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
      ...headers,
    }
  }
}

type OperationConfig = {
  pk: string
  sk: string
  details: {
    cost: number
  }
}

type UserConfig = {
  details: {
    status: "active" | "inactive"
    user_balance: number
  }
}

type RecordItem = {
  pk: string
  sk: number
  details: {
    amount: number
    operation_type: string
    user_balance: number
  }
}

type RequestParams = {
  values: number[]
  email: string
}

const { OPERATIONS_TABLE } = process.env

if (!OPERATIONS_TABLE) {
  throw new Error("Missing dynamodb environment variables")
}

const dynamoDbClient = new dynamodb.DynamoDBClient({})

const getInput = (input: string): RequestParams => {
  try {
    const { values, email } = JSON.parse(input) as RequestParams

    if (values.length < 1 || !email) {
      throw new PreconditionException("Incorrect input provided")
    }

    return {
      values,
      email,
    }
  } catch (error) {
    throw error
  }
}

const getUserConfig = async (email: string): Promise<UserConfig> => {
  try {
    const command = new dynamodb.GetItemCommand({
      TableName: OPERATIONS_TABLE,
      Key: {
        pk: { S: `user#${email}` },
        sk: { N: "2" },
      },
    })

    const response = await dynamoDbClient.send(command)

    if (!response.Item) {
      throw new NotFoundException("User not found")
    }

    return unmarshall(response.Item) as UserConfig
  } catch (error) {
    throw error
  }
}

const getOperationConfig = async (operation: string) => {
  const command = new dynamodb.GetItemCommand({
    TableName: OPERATIONS_TABLE,
    Key: {
      pk: { S: operation },
      sk: { N: "1" },
    },
  })

  const response = await dynamoDbClient.send(command)

  if (!response.Item) {
    throw new NotFoundException("Operation not found")
  }

  return unmarshall(response.Item) as OperationConfig
}

const makeOperation = (userConfig: UserConfig, values: number[]): number => {
  const currentCredits = userConfig.details.user_balance

  if (currentCredits < 1) {
    throw new PreconditionException(
      "User has not credit to perform this operation"
    )
  }

  return values.reduce((acc, value) => {
    return acc + value
  }, 0)
}

const saveOperation = async (record: RecordItem) => {
  try {
    const recordCommand = new dynamodb.PutItemCommand({
      TableName: OPERATIONS_TABLE,
      Item: marshall(record),
    })

    return await dynamoDbClient.send(recordCommand)
  } catch (error) {
    throw error
  }
}

export const addition = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return new CustomResponse(400, { message: "No body provided" })
    }

    const { values, email } = getInput(event.body)

    const userConfig = await getUserConfig(email)

    const operationConfig = await getOperationConfig("addition")

    const operationResult = makeOperation(userConfig, values)

    const operationRecord = {
      pk: email,
      sk: Date.now(),
      details: {
        operation_type: "addition",
        amount: operationResult,
        user_balance:
          userConfig.details.user_balance - operationConfig.details.cost,
      },
    }

    await saveOperation(operationRecord)

    return new CustomResponse(200, { result: operationResult })
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
