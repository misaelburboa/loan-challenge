import { additionOperation } from '../addition';

describe("Addition", () => {
  it('Should return the correct result', async () => {
    const sum = additionOperation([1,2])

    expect(sum).toBe(2)
  })
})