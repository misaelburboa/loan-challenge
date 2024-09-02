import * as dynamodb from "@aws-sdk/client-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

export class PreconditionException extends Error {
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

export class NotFoundException extends Error {
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

export class CustomResponse {
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

export type OperationConfig = {
  pk: string
  sk: string
  details: {
    cost: number
  }
}

export type UserConfig = {
  details: {
    status: "active" | "inactive"
    user_balance: number
  }
}

export type RecordItem = {
  pk: string
  sk: number
  details: {
    amount?: number
    operation_type: string
    user_balance: number
  }
}

export type RequestParams<T> = {
  params: T
  email: string
}

type OperationFunction = (values: number[]) => number

type RandomStringGenerator = (params: { num: number; len: number }) => string

const { OPERATIONS_TABLE } = process.env

export class Operation {
  type: string

  email: string

  dynamoDbClient = new dynamodb.DynamoDBClient({})

  constructor(type: string) {
    this.type = type
  }

  private isEmptyObject(obj: Record<string, string>) {
    return Object.keys(obj).length === 0;
  }

  setEmail(email: string) {
    this.email = email
  }

  getInput<T>(input: string): RequestParams<T> {
    try {
      const { params, email } = JSON.parse(input) as RequestParams<T>

      this.setEmail(email)

      if (this.isEmptyObject(params as Record<string, string>) || !email) {
        throw new PreconditionException("Incorrect input provided")
      }

      return {
        params,
        email,
      }
    } catch (error) {
      throw error
    }
  }

  async getUserConfig(email: string): Promise<UserConfig> {
    try {
      const command = new dynamodb.GetItemCommand({
        TableName: OPERATIONS_TABLE,
        Key: {
          pk: { S: `user#${email}` },
          sk: { N: "2" },
        },
      })

      const response = await this.dynamoDbClient.send(command)

      if (!response.Item) {
        throw new NotFoundException("User not found")
      }

      return unmarshall(response.Item) as UserConfig
    } catch (error) {
      throw error
    }
  }

  async getOperationConfig(operation: string, type: "1" | "2") {
    const command = new dynamodb.GetItemCommand({
      TableName: OPERATIONS_TABLE,
      Key: {
        pk: { S: operation },
        sk: { N: type },
      },
    })

    const response = await this.dynamoDbClient.send(command)

    if (!response.Item) {
      throw new NotFoundException("Operation not found")
    }

    return unmarshall(response.Item) as OperationConfig
  }

  validateUserCredits(userConfig: UserConfig, cost: number) {
    const currentCredits = userConfig.details.user_balance

    if (currentCredits < cost) {
      throw new PreconditionException(
        "User has not credit to perform this operation"
      )
    }

    return true
  }

  async updateUserCredit(userConfig: UserConfig, operationCost: number) {
    try {
      const updateUserBalance = userConfig.details.user_balance - operationCost

      const updateCommand = new dynamodb.UpdateItemCommand({
        TableName: OPERATIONS_TABLE,
        Key: {
          pk: { S: `user#${this.email}` },
          sk: { N: "2" },
        },
        UpdateExpression: "SET #details = :details",
        ExpressionAttributeNames: { "#details": "details" },
        ExpressionAttributeValues: {
          ":details": {
            M: marshall({
              ...userConfig.details,
              user_balance: updateUserBalance,
            }),
          },
        },
        ReturnValues: "ALL_NEW",
      })

      await this.dynamoDbClient.send(updateCommand)
    } catch (error) {
      throw error
    }
  }

  async saveOperation(record: RecordItem) {
    try {
      const recordCommand = new dynamodb.PutItemCommand({
        TableName: OPERATIONS_TABLE,
        Item: marshall(record),
      })

      return await this.dynamoDbClient.send(recordCommand)
    } catch (error) {
      throw error
    }
  }

  async makeOperation(
    userConfig: UserConfig,
    operationCost: number,
    operation: OperationFunction,
    values: number[]
  ) {
    try {
      this.validateUserCredits(userConfig, operationCost)

      const operationResult = operation(values)

      this.updateUserCredit(userConfig, operationCost)

      return operationResult
    } catch (error) {
      throw error
    }
  }
}
