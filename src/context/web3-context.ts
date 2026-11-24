import { createContext } from "react";
import { Poll, Transaction } from "@/lib/web3";

export interface Web3ContextValue {
  hasWallet: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  isWrongNetwork: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
  getAllPolls: () => Promise<Poll[]>;
  getPoll: (pollId: number) => Promise<Poll>;
  createPoll: (title: string, options: string[]) => Promise<Transaction>;
  vote: (pollId: number, optionIndex: number) => Promise<Transaction>;
  endPoll: (pollId: number) => Promise<Transaction>;
}

export const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

