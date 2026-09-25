"use client";

import { useState, type FormEvent } from "react";
import {
  usePublicClient,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  formatEther,
  isAddress,
  parseEther,
  type Address,
  type Hash,
} from "viem";

type TransferFormProps = {
  address: Address;
  balance?: bigint;
  isSepolia: boolean;
};

type TransferReview = {
  amount: string;
  estimatedFee: bigint;
  to: Address;
  value: bigint;
};

function wasRejected(error: Error | null) {
  let current: unknown = error;

  while (current && typeof current === "object") {
    const candidate = current as {
      cause?: unknown;
      code?: number;
      message?: string;
      name?: string;
    };

    if (
      candidate.code === 4001 ||
      candidate.name === "UserRejectedRequestError" ||
      candidate.message?.toLowerCase().includes("user rejected")
    ) {
      return true;
    }

    current = candidate.cause;
  }

  return false;
}

function TransactionLink({ hash }: { hash: Hash }) {
  return (
    <a
      className="break-all font-mono text-sm text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-200"
      href={`${sepolia.blockExplorers.default.url}/tx/${hash}`}
      rel="noreferrer"
      target="_blank"
    >
      {hash}
    </a>
  );
}

export function TransferForm({
  address,
  balance,
  isSepolia,
}: TransferFormProps) {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [review, setReview] = useState<TransferReview | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const transaction = useSendTransaction();
  const receipt = useWaitForTransactionReceipt({
    chainId: sepolia.id,
    hash: transaction.data,
  });

  const approvalRejected = wasRejected(transaction.error);
  const receiptFailed = receipt.data?.status === "reverted";
  const transactionFailed =
    (!approvalRejected && Boolean(transaction.error)) ||
    Boolean(receipt.error) ||
    receiptFailed;

  let status: "Awaiting approval" | "Failed" | "Pending" | "Successful" | null =
    null;

  if (transaction.isPending) status = "Awaiting approval";
  else if (transaction.data && receipt.isPending) status = "Pending";
  else if (receipt.data?.status === "success") status = "Successful";
  else if (transactionFailed) status = "Failed";

  function clearReview() {
    setReview(null);
    setValidationError(null);
    transaction.reset();
  }

  async function reviewTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setReview(null);
    transaction.reset();

    if (!isSepolia) {
      setValidationError("Switch MetaMask to Sepolia before transferring ETH.");
      return;
    }

    if (!isAddress(receiver)) {
      setValidationError("Enter a valid Ethereum receiver address.");
      return;
    }

    let value: bigint;
    try {
      value = parseEther(amount);
      if (value <= BigInt(0)) throw new Error("Amount must be positive");
    } catch {
      setValidationError("Enter an ETH amount greater than zero.");
      return;
    }

    if (balance === undefined) {
      setValidationError("Your Sepolia balance is not available yet.");
      return;
    }

    if (value >= balance) {
      setValidationError("Insufficient Sepolia ETH for the amount and network fee.");
      return;
    }

    if (!publicClient) {
      setValidationError("The Sepolia RPC client is not available.");
      return;
    }

    setIsReviewing(true);

    try {
      const to = receiver as Address;
      const [gas, gasPrice] = await Promise.all([
        publicClient.estimateGas({ account: address, to, value }),
        publicClient.getGasPrice(),
      ]);
      const estimatedFee = gas * gasPrice;

      if (value + estimatedFee > balance) {
        setValidationError(
          `Insufficient funds. Keep approximately ${formatEther(estimatedFee)} ETH for the estimated fee.`,
        );
        return;
      }

      setReview({ amount, estimatedFee, to, value });
    } catch (error) {
      setValidationError(
        error instanceof Error
          ? error.message
          : "Unable to estimate the transaction fee.",
      );
    } finally {
      setIsReviewing(false);
    }
  }

  async function confirmTransfer() {
    if (!review || !isSepolia) return;

    try {
      await transaction.mutateAsync({
        chainId: sepolia.id,
        to: review.to,
        value: review.value,
      });
    } catch {
      // Wagmi exposes rejected and failed requests through transaction.error.
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Transfer ETH</h2>
        <p className="mt-1 text-sm text-slate-400">
          Review the receiver, amount, and estimated Sepolia fee before opening
          MetaMask.
        </p>
      </div>

      <form className="space-y-5" onSubmit={reviewTransfer}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Receiver address
          </span>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
            onChange={(event) => {
              setReceiver(event.target.value.trim());
              clearReview();
            }}
            placeholder="0x…"
            spellCheck={false}
            type="text"
            value={receiver}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            ETH amount
          </span>
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
            inputMode="decimal"
            min="0"
            onChange={(event) => {
              setAmount(event.target.value);
              clearReview();
            }}
            placeholder="0.01"
            step="any"
            type="number"
            value={amount}
          />
        </label>

        {validationError && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {validationError}
          </p>
        )}

        <button
          className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isReviewing || transaction.isPending}
          type="submit"
        >
          {isReviewing ? "Checking transfer…" : "Review transfer"}
        </button>
      </form>

      {review && (
        <div className="mt-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-5">
          <h3 className="font-semibold text-slate-100">Transfer review</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Receiver</dt>
              <dd className="mt-1 break-all font-mono text-slate-200">
                {review.to}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Amount</dt>
              <dd className="text-slate-200">{review.amount} ETH</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Estimated fee</dt>
              <dd className="text-slate-200">
                {formatEther(review.estimatedFee)} ETH
              </dd>
            </div>
          </dl>

          {!transaction.data && !approvalRejected && !transactionFailed && (
            <button
              className="mt-5 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isSepolia || transaction.isPending}
              onClick={confirmTransfer}
              type="button"
            >
              {transaction.isPending
                ? "Awaiting approval…"
                : "Confirm in MetaMask"}
            </button>
          )}
        </div>
      )}

      {(status || approvalRejected || transaction.data) && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm text-slate-500">Transaction status</p>
          <p
            className={`mt-1 font-semibold ${
              status === "Successful"
                ? "text-emerald-300"
                : status === "Failed" || approvalRejected
                  ? "text-rose-300"
                  : "text-amber-300"
            }`}
          >
            {approvalRejected ? "Approval rejected" : status}
          </p>

          {transaction.data && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-slate-500">Transaction hash</p>
              <TransactionLink hash={transaction.data} />
            </div>
          )}

          {(transactionFailed || approvalRejected) && (
            <p className="mt-3 text-sm text-rose-200">
              {approvalRejected
                ? "The transaction was not submitted because approval was declined in MetaMask."
                : transaction.error?.message ??
                  receipt.error?.message ??
                  "The transaction failed on Sepolia."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
