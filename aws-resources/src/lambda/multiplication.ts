import * as lambda from "aws-lambda"
import {
  CustomResponse,
  NotFoundException,
  Operation,
  PreconditionException,
} from "../classes/Operation"

const multiplyOperation = (values: number[]) => {
  const result = values.reduce((acc, value) => {
    return acc * value
  })

  return result
}

export class Multiplication extends Operation {
  constructor() {
    super("multiplication")
  }

  async executeOperation(body: string) {
    try {
      const input = this.getInput(body)

      const email = input.email
      const params = input.params as { values: number[] }

      const userConfig = await this.getUserConfig(email)

      const operationConfig = await this.getOperationConfig(this.type, "1")

      const operationResult = await this.makeOperation(
        userConfig,
        operationConfig.details.cost,
        multiplyOperation,
        params.values
      )

      const operationRecord = {
        pk: email,
        sk: Date.now(),
        details: {
          operation_type: this.type,
          amount: operationResult,
          user_balance:
            userConfig.details.user_balance - operationConfig.details.cost,
        },
      }

      await this.saveOperation(operationRecord)

      return operationResult
    } catch (error) {
      throw error
    }
  }
}

const multiplicationInstance = new Multiplication()

export const multiplication = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return new CustomResponse(400, { message: "No body provided" })
    }

    const operationResult = await multiplicationInstance.executeOperation(
      event.body
    )

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
