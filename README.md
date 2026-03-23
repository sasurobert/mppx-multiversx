# MPP MultiversX SDK

A spec-compliant implementation of the **Mobile Payment Protocol (MPP)** for the **MultiversX** blockchain. This SDK provides both client-side and server-side utilities for integrating MPP payments into your agentic applications.

## Features

- **Spec Compliant**: Follows the [MPP Specification](https://github.com/tempoxyz/mpp-specs).
- **BigInt Arithmetic**: Robust decimal handling without floating-point errors.
- **MultiversX Native**: Built-in support for EGLD and ESDT (Elrond Standard Digital Token) transfers.
- **Flexible Verification**: Highly configurable verification logic for both simple and complex payment flows.
- **Advanced Parameters**: Support for `opaque`, `digest` (RFC 9530), `source`, and `currency`.

## Installation

```bash
npm install mppx-multiversx
```

## Usage

### Server-side Initialization

```typescript
import { Mppx } from 'mppx/server';
import { multiversx } from 'mppx-multiversx/server';

const mvxMethod = multiversx({
  decimals: 18,
  chainId: 'D', // Devnet
  currency: 'EGLD',
  verifyTransaction: async ({ txHash, sender, amount, challengeId }) => {
    // Your verification logic here
    // Verify txHash on the blockchain, compare sender, amount, etc.
    return true;
  }
});

const mpp = Mppx.create({
  methods: [mvxMethod],
  secretKey: process.env.MPP_SECRET_KEY,
});
```

### Client-side Usage

```typescript
import { MppxClient } from 'mppx/client';
import { multiversx } from 'mppx-multiversx/client';

const client = new MppxClient({
  methods: [multiversx()]
});

// Charge a challenge
// charge(challenge) -> payment credential
```

## Advanced Verification

The SDK supports `MultiTransferESDT` and `MultiESDTNFTTransfer` verification. It parses the MultiversX `data` field to ensure that multi-token transfers match the expected payment requirements.

## License

MIT
