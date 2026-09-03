import { Errors, Method } from 'mppx'
import * as Methods from '../Methods.js'

export function session<const parameters extends session.Parameters>(parameters: parameters) {
  const { amount, decimals, description, externalId, metadata, chainId, currency, duration, verifyTransaction } =
    parameters

  type Defaults = session.DeriveDefaults<parameters>
  return Method.toServer<typeof Methods.session, Defaults>(Methods.session, {
    defaults: {
      amount,
      decimals,
      description,
      externalId,
      metadata,
      chainId,
      currency,
      duration,
    } as unknown as Defaults,

    async verify({ credential }) {
      const { challenge } = credential
      const parsed = Methods.session.schema.credential.payload.safeParse(credential.payload)
      if (!parsed.success) throw new Error('Invalid credential payload')

      const payload = parsed.data as any
      const isVoucher = Boolean(payload.channelId && payload.signature)

      if (isVoucher && parameters.verifyVoucher) {
        const result = await parameters.verifyVoucher({
          channelId: payload.channelId,
          employer: payload.employer,
          amount: payload.amount,
          nonce: payload.nonce,
          signature: payload.signature,
          sender: payload.sender ?? payload.employer,
          challengeId: challenge.id,
          source: credential.source,
          opaque: challenge.opaque,
          digest: challenge.digest,
        })

        if (!result.success) {
          throw new Errors.VerificationFailedError({
            reason: result.error ?? 'MultiversX Voucher verification failed',
          })
        }

        return {
          method: 'multiversx',
          status: 'success',
          timestamp: new Date().toISOString(),
          reference: payload.channelId,
          ...(payload.externalId ? { externalId: payload.externalId } : {}),
        } as const
      }

      if (parameters.verifyTransaction) {
        const txHash = payload.txHash ?? ''
        const sender = payload.sender ?? payload.employer ?? ''
        const result = await parameters.verifyTransaction({
          txHash,
          sender,
          challengeId: challenge.id,
          amount: challenge.request.amount as string,
          currency: challenge.request.currency as string,
          duration: challenge.request.duration as string,
          source: credential.source,
          opaque: challenge.opaque,
          digest: challenge.digest,
        })

        if (!result.success) {
          throw new Errors.VerificationFailedError({
            reason: result.error ?? 'MultiversX Transaction verification failed',
          })
        }

        return {
          method: 'multiversx',
          status: 'success',
          timestamp: new Date().toISOString(),
          reference: txHash,
          ...(payload.externalId ? { externalId: payload.externalId } : {}),
        } as const
      }

      throw new Error('No appropriate verifier provided for credential payload')
    },
  })
}

export declare namespace session {
  type Defaults = Omit<Method.RequestDefaults<typeof Methods.session>, 'recipient'>

  type Parameters = {
    verifyTransaction?: (parameters: {
      txHash: string
      sender: string
      challengeId: string
      amount: string
      currency: string
      duration: string
      source?: string | undefined
      opaque?: Record<string, string> | undefined
      digest?: string | undefined
    }) => Promise<{ success: boolean; error?: string }>
    verifyVoucher?: (parameters: {
      channelId: string
      employer: string
      amount: string
      nonce: number | string
      signature: string
      sender?: string
      challengeId: string
      source?: string | undefined
      opaque?: Record<string, string> | undefined
      digest?: string | undefined
    }) => Promise<{ success: boolean; error?: string }>
  } & Defaults

  type DeriveDefaults<parameters extends Parameters> = Pick<
    parameters,
    Extract<keyof parameters, keyof Defaults>
  > & { decimals: number; chainId: string; currency: string; duration: string }
}
