"use client";

import {
  useBalance,
  useConnect,
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { formatUnits } from "viem";

import { TransferForm } from "@/components/transfer-form";

export default function Home() {
  const connection = useConnection();
  const balance = useBalance({
    address: connection.address,
    chainId: sepolia.id,
  });
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    error: switchError,
    isPending: isSwitching,
    mutate: switchChain,
  } = useSwitchChain();

  const metaMask = connectors.find((connector) => connector.id === "metaMask");
  const isConnected = connection.status === "connected";
  const isSepolia = connection.chainId === sepolia.id;
  const networkName =
    connection.chain?.name ?? `Unknown network (${connection.chainId})`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur sm:p-12">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Sepolia testnet
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ethereum Wallet Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Connect MetaMask to view your wallet address and testnet ETH
              balance.
            </p>
          </div>
          <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Chain ID {sepolia.id}
          </span>
        </div>

        {isConnected && connection.address ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-500">Connected wallet</p>
                <p className="mt-2 break-all font-mono text-sm text-slate-100">
                  {connection.address}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-500">Current network</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {networkName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Chain ID {connection.chainId}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-500">Sepolia balance</p>
                <p className="mt-2 text-lg font-medium text-slate-100">
                  {balance.isPending
                    ? "Loading…"
                    : `${
                        balance.data
                          ? formatUnits(
                              balance.data.value,
                              balance.data.decimals,
                            )
                          : "0"
                      } ${balance.data?.symbol ?? "ETH"}`}
                </p>
              </div>
            </div>

            {!isSepolia && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
                <p>MetaMask is connected to another network.</p>
                <button
                  className="mt-3 rounded-lg bg-amber-300 px-4 py-2 font-semibold text-amber-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSwitching}
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  type="button"
                >
                  {isSwitching ? "Switching…" : "Switch to Sepolia"}
                </button>
                {switchError && (
                  <p className="mt-3 text-rose-300">{switchError.message}</p>
                )}
              </div>
            )}

            <TransferForm
              address={connection.address}
              balance={balance.data?.value}
              isSepolia={isSepolia}
            />

            <button
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={() => disconnect()}
              type="button"
            >
              Disconnect wallet
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
            <p className="text-slate-400">
              Your wallet is not connected yet.
            </p>
            <button
              className="mt-5 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!metaMask || isPending}
              onClick={() =>
                metaMask &&
                connect({ connector: metaMask, chainId: sepolia.id })
              }
              type="button"
            >
              {isPending ? "Connecting…" : "Connect MetaMask"}
            </button>
            {!metaMask && (
              <p className="mt-4 text-sm text-amber-300">
                Install the MetaMask browser extension to continue.
              </p>
            )}
            {error && (
              <p className="mt-4 text-sm text-rose-300">{error.message}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
