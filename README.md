# Ethereum Wallet Dashboard

A Sepolia testnet wallet dashboard built with Next.js, Wagmi, Viem, TanStack
Query, Redux Toolkit, and MetaMask.

## Features

- Connect and disconnect an installed MetaMask wallet.
- Display the connected account, current network, and Sepolia ETH balance.
- Switch MetaMask to Sepolia when it is connected to another network.
- Refresh the displayed balance on demand.
- Review a native ETH transfer before requesting wallet approval.
- Validate the receiver, amount, network, balance, and estimated network fee.
- Track a transaction through awaiting approval, pending, successful, failed,
  and rejected-approval states.
- Link submitted transactions to Sepolia Etherscan.

## Local setup

Install dependencies:

```bash
npm install
```

Optionally add a dedicated Sepolia RPC URL to `.env.local`:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://your-sepolia-rpc-url
```

If this variable is omitted, Wagmi uses Sepolia's default public RPC endpoint.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser with MetaMask
installed.

## Wallet connection test

1. Unlock MetaMask and select the Sender account.
2. Click **Connect MetaMask** and approve the connection.
3. If necessary, click **Switch to Sepolia** and approve the network change.
4. Confirm that the full account address and `Sepolia` with chain ID `11155111`
   appear in the dashboard.
5. Compare the dashboard balance with the Sender account's Sepolia ETH balance
   in MetaMask.

MetaMask may restore a previously authorized account while the extension is
locked. Network switching and transaction signing still require the wallet to
be unlocked.

## Transfer test

Use only Sepolia test ETH. Never use a mainnet wallet or real funds for this
test.

1. Copy the Receiver account address from MetaMask.
2. Enter the address and a small amount, such as `0.0001` ETH.
3. Click **Review transfer**.
4. Verify the receiver, amount, and estimated fee in the review panel.
5. Click **Confirm in MetaMask** and compare MetaMask's final values with the
   review before approving.
6. Observe the dashboard states: **Awaiting approval**, **Pending**, and then
   **Successful** or **Failed**. Rejecting in MetaMask is shown separately as
   **Approval rejected**.
7. After submission, open the transaction hash link and verify the transaction
   on [Sepolia Etherscan](https://sepolia.etherscan.io/).
8. After confirmation, click **Refresh balance** and compare the updated Sender
   balance with MetaMask. The final cost includes the sent amount and the actual
   gas fee, so it can differ slightly from the review estimate.

## Test evidence

Record the manual test evidence after approving the transaction:

| Item | Value |
| --- | --- |
| Sender address | `Not recorded` |
| Receiver address | `Not recorded` |
| Amount | `Not recorded` |
| Transaction hash | `Not recorded` |
| Sepolia Etherscan result | `Not recorded` |

Screenshots should avoid exposing seed phrases, private keys, passwords, or
unrelated wallet accounts. Capture these views after the manual test:

1. Connected dashboard showing the Sender address, Sepolia network, and balance.
2. Successful transaction state showing the transaction hash.
3. Sepolia Etherscan transaction page showing the confirmed result.

## Verification

Run the automated project checks:

```bash
npm run lint
npm run build
```

These checks validate lint rules, TypeScript, and the production Next.js build.
They do not replace the MetaMask approval and live Sepolia transfer test.
