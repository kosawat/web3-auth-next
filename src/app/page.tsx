"use client";

import { IProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { SolanaWallet } from "@web3auth/solana-provider";
import {
  Connection,
  ConnectionConfig,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { useEffect, useState } from "react";
import Link from "next/link";

const web3AuthClientId =
  process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "Your_Web3Auth_Client_ID";

export default function Home() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [web3authProvider, setWeb3authProvider] =
    useState<IProvider | null | void>(null);
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null);
  const [userAccounts, setUserAccounts] = useState<string[] | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId: web3AuthClientId,
          web3AuthNetwork: "sapphire_mainnet", // Web3Auth Network
          chainConfig: {
            chainNamespace: "solana",
            chainId: "0x1",
            rpcTarget: "https://api.devnet.solana.com",
            displayName: "Solana Mainnet",
            blockExplorer: "https://explorer.solana.com/",
            ticker: "SOL",
            tickerName: "Solana",
          },
        });

        setWeb3auth(web3auth);
        await web3auth.initModal();
      } catch (error) {
        console.log(error);
      }
    };

    initWeb3Auth();
  }, []);

  const web3AuthLogin = async () => {
    if (!web3auth) {
      console.log("web3auth not initialised!");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setWeb3authProvider(web3authProvider);

    const solanaWallet = web3authProvider && new SolanaWallet(web3authProvider);
    setSolanaWallet(solanaWallet);

    const userAccounts = solanaWallet && (await solanaWallet.requestAccounts());
    setUserAccounts(userAccounts);

    const connectionConfig: any =
      solanaWallet &&
      (await solanaWallet.request({
        method: "solana_provider_config",
        params: [],
      }));

    const connection: Connection | null =
      connectionConfig && new Connection(connectionConfig.rpcTarget);

    // Fetch the balance for the specified public key
    const balance =
      userAccounts &&
      connection &&
      (await connection.getBalance(new PublicKey(userAccounts[0])));
    setBalance(balance);
  };

  const web3AuthLogout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialised!");
      return;
    }

    const web3authProvider = await web3auth.logout();
    setWeb3authProvider(web3authProvider);
    setSolanaWallet(null);
    setUserAccounts(null);
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-24">
      <div className="flex-row flex z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-3xl font-bold mx-auto">Login with Web3Auth</h1>
        {userAccounts ? (
          <button
            className="p-4 bg-red-600 rounded-md text-white"
            onClick={web3AuthLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="p-4 bg-red-600 rounded-md text-white"
            onClick={web3AuthLogin}
          >
            Login
          </button>
        )}
      </div>

      {solanaWallet && (
        <div className="mx-auto py-10">
          <p>
            User Account:{" "}
            <Link
              href={`https://solscan.io/account/${userAccounts}`}
              target="_blank"
              className="text-blue-700"
            >
              {userAccounts}
            </Link>
          </p>
          <p>Balance: {balance} SOL</p>
        </div>
      )}
    </main>
  );
}
