import { Challenge, Credential, Method, z } from 'mppx'
import * as Methods from '../Methods.js'

export function session(parameters: session.Parameters) {
  const { signAndSendTransaction, createVoucher, externalId } = parameters

  return Method.toClient(Methods.session, {
    context: z.object({
      sender: z.string(),
    }),

    async createCredential({ challenge, context }) {
      const sender = context.sender
      const amount = challenge.request.amount as string
      const currency = challenge.request.currency as string
      const duration = challenge.request.duration as string
      const chainId = challenge.request.methodDetails?.chainId as string | undefined
      const recipient = challenge.request.recipient as string

      if (createVoucher) {
        const voucher = await createVoucher({
          amount,
          challenge,
          currency,
          duration,
          chainId,
          sender,
          recipient,
        })

        return Credential.serialize({
          challenge,
          payload: {
            ...voucher,
            sender: voucher.sender ?? sender,
            ...(externalId ? { externalId } : {}),
          },
        })
      }

      if (signAndSendTransaction) {
        const res = await signAndSendTransaction({
          amount,
          challenge,
          currency,
          duration,
          chainId,
          sender,
          recipient,
        })

        return Credential.serialize({
          challenge,
          payload: {
            txHash: res.txHash,
            sender: res.sender,
            ...(externalId ? { externalId } : {}),
          },
        })
      }

      throw new Error('Either signAndSendTransaction or createVoucher must be provided')
    },
  })
}

export declare namespace session {
  type Parameters = {
    signAndSendTransaction?: (parameters: OnChallengeParameters) => Promise<{ txHash: string; sender: string }>
    createVoucher?: (parameters: OnChallengeParameters) => Promise<{
      channelId: string
      employer: string
      amount: string
      nonce: number | string
      signature: string
      sender?: string
      txHash?: string
    }>
    externalId?: string | undefined
  }

  type OnChallengeParameters = {
    amount: string
    challenge: Challenge.Challenge<
      z.output<typeof Methods.session.schema.request>,
      typeof Methods.session.intent,
      typeof Methods.session.name
    >
    currency: string
    duration: string
    chainId?: string | undefined
    sender: string
    recipient: string
  }
}
