import * as lambda from "aws-lambda"
import {
  CustomResponse,
  NotFoundException,
  Operation,
  PreconditionException,
} from "../classes/Operation"

const subtractOperation = (values: number[]) => {
  const result = values.reduce((acc, value) => {
    return acc - value
  })

  return result
}


export class Subtract extends Operation {
  constructor() {
    super("subtract")
  }

  async executeOperation(body: string) {
    const input = this.getInput(body)

    const email = input.email
    const params = input.params as { values: number[] }

    const userConfig = await this.getUserConfig(email)

    const operationConfig = await this.getOperationConfig(this.type, "1")

    const operationResult = await this.makeOperation(
      userConfig,
      operationConfig.details.cost,
      subtractOperation,
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
  }
}

const subtractInstance = new Subtract()

export const subtract = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return new CustomResponse(400, { message: "No body provided" })
    }

    const operationResult = await subtractInstance.executeOperation(event.body)

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
