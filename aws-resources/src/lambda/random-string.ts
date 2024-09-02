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

  async generateRandomString(params: { num: number; len: number }) {
    return "MisaYoullgetit"
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

      this.validateUserCredits(userConfig, operationConfig.details.cost)

      const generatedString = await this.generateRandomString(
        params as RandomStringParams
      )

      const operationRecord = {
        pk: email,
        sk: Date.now(),
        details: {
          operation_type: this.type,
          stringGenerated: generatedString,
          user_balance:
            userConfig.details.user_balance - operationConfig.details.cost,
        },
      }

      await this.saveOperation(operationRecord)

      return new CustomResponse(200, { result: generatedString })
    } catch (e) {
      if (e instanceof PreconditionException) {
        return new CustomResponse(PreconditionException.NUMBER_CODE, {
          message: e.message,
        })
      }

      return new CustomResponse(500, {
        message: (e as Error).message,
      })
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
