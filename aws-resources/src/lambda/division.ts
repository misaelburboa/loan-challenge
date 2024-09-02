import * as lambda from "aws-lambda"
import {
  CustomResponse,
  NotFoundException,
  Operation,
  PreconditionException,
} from "../classes/Operation"

const divisionOperation = (values: number[]) => {
  try {
    if (values.length === 0) {
      throw new PreconditionException("Invalid input")
    }

    let total = values[0]
    for (let i = 1; i < values.length; i++) {
      if (values[i] === 0) {
        throw new PreconditionException("Cannot divide by zero")
      }
      total /= values[i]
    }

    return total
  } catch (error) {
    throw error
  }
}

export class Division extends Operation {
  constructor() {
    super("division")
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
      divisionOperation,
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

const divisionInstance = new Division()

export const division = async (event: lambda.APIGatewayProxyEvent) => {
  try {
    if (!event.body) {
      return new CustomResponse(400, { message: "No body provided" })
    }

    const operationResult = await divisionInstance.executeOperation(event.body)

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
