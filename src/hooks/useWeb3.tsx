
import { useState, useEffect } from "react";
import { web3Provider, Poll, Transaction } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

interface UseWeb3Return {
  isConnected: boolean;
  account: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getAllPolls: () => Promise<Poll[]>;
  getPoll: (pollId: number) => Promise<Poll>;
  createPoll: (title: string, options: string[]) => Promise<Transaction>;
  vote: (pollId: number, optionIndex: number) => Promise<Transaction>;
  endPoll: (pollId: number) => Promise<Transaction>;
}

export function useWeb3(): UseWeb3Return {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await connect();
          }
        } catch (err) {
          console.error("Failed to check existing connection:", err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account]);

  // Connect to wallet
  const connect = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const connectedAccount = await web3Provider.connect();
      
      if (connectedAccount) {
        setAccount(connectedAccount);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`,
        });
      } else {
        setError("Failed to connect wallet");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      toast({
        title: "Connection Error",
        description: err.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = (): void => {
    web3Provider.disconnect();
    setAccount(null);
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Get all polls
  const getAllPolls = async (): Promise<Poll[]> => {
    try {
      return await web3Provider.getAllPolls();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch polls",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Get a specific poll
  const getPoll = async (pollId: number): Promise<Poll> => {
    try {
      return await web3Provider.getPoll(pollId);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to fetch poll #${pollId}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  // Create a poll
  const createPoll = async (title: string, options: string[]): Promise<Transaction> => {
    try {
      const tx = await web3Provider.createPoll(title, options);
      toast({
        title: "Transaction Sent",
        description: "Creating poll. Please wait for confirmation.",
      });
      return tx;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create poll",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Vote in a poll
  const vote = async (pollId: number, optionIndex: number): Promise<Transaction> => {
    try {
      const tx = await web3Provider.vote(pollId, optionIndex);
      toast({
        title: "Transaction Sent",
        description: "Submitting vote. Please wait for confirmation.",
      });
      return tx;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit vote",
        variant: "destructive",
      });
      throw err;
    }
  };

  // End a poll
  const endPoll = async (pollId: number): Promise<Transaction> => {
    try {
      const tx = await web3Provider.endPoll(pollId);
      toast({
        title: "Transaction Sent",
        description: "Ending poll. Please wait for confirmation.",
      });
      return tx;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to end poll",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    isConnected,
    account,
    isLoading,
    error,
    connect,
    disconnect,
    getAllPolls,
    getPoll,
    createPoll,
    vote,
    endPoll,
  };
}
