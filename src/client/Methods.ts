import * as Charge from './Charge.js'

export function multiversx(
  parameters: Charge.charge.Parameters,
): ReturnType<typeof Charge.charge> {
  return Charge.charge(parameters)
}

export declare namespace multiversx {
  export type Parameters = Charge.charge.Parameters // typescript namespace workaround for tsup
}
