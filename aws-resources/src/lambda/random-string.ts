import * as lambda from "aws-lambda"
import {
  CustomResponse,
  NotFoundException,
  Operation,
  PreconditionException,
} from "../classes/Operation"

type RandomStringParams = {
  num: number
  len: number
}

export class RandomString extends Operation {
  constructor() {
    super("random-str")
  }

  async generateRandomString({ num, len }: { num: number; len: number }) {
    const url = process.env.RANDOM_STRING_API_ENDPOINT as string
    const apiKey = process.env.RANDOM_STRING_API_KEY as string

    const requestBody = {
      jsonrpc: "2.0",
      method: "generateStrings",
      params: {
        apiKey: apiKey,
        n: num,
        length: len,
        characters:
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        replacement: true,
      },
      id: 1,
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorDetails = await response.text()
        const errorMessage = JSON.parse(errorDetails).message

        throw new Error(errorMessage)
      }

      const { result } = await response.json()

      return result.random.data
    } catch (error) {
      console.error("Error fetching random strings data:", error)
      throw error
    }
  }

  async executeOperation(body: string) {
    try {
      const { params, email } = this.getInput(body)

      const { num, len } = params as RandomStringParams

      if (!num || !len) {
        throw new PreconditionException("Parameters provided not valid")
      }

      const userConfig = await this.getUserConfig(email)

      const operationConfig = await this.getOperationConfig(this.type, "1")
      const operationCost = operationConfig.details.cost

      this.validateUserCredits(userConfig, operationCost)

      this.validateActiveUser()

      const generatedStrings = await this.generateRandomString(
        params as RandomStringParams
      )

      const operationRecord = {
        pk: email,
        sk: Date.now(),
        details: {
          operation_type: this.type,
          stringsGenerated: generatedStrings,
          user_balance:
            userConfig.details.user_balance - operationConfig.details.cost,
        },
      }

      this.updateUserCredit(userConfig, operationCost)

      await this.saveOperation(operationRecord)

      return generatedStrings
    } catch (error) {
      throw error
    }
  }
}

const rsInstance = new RandomString()

export const randomString = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return new CustomResponse(400, { message: "No body provided" })
    }

    const operationResult = await rsInstance.executeOperation(event.body)

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
