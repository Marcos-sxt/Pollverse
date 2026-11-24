import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  web3Provider,
  Poll,
  Transaction,
  SEPOLIA_CHAIN_ID,
  getWeb3ErrorMessage,
} from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { Web3Context } from "@/context/web3-context";

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [hasWallet] = useState<boolean>(() => typeof window !== "undefined" && !!window.ethereum);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isWrongNetwork = isConnected && chainId !== null && chainId !== SEPOLIA_CHAIN_ID;

  const disconnect = useCallback(
    (silent = false): void => {
      web3Provider.disconnect();
      setAccount(null);
      setChainId(null);
      setIsConnected(false);
      setError(null);
      queryClient.removeQueries({ queryKey: ["polls"] });
      queryClient.removeQueries({ queryKey: ["poll"] });

      if (!silent) {
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      }
    },
    [queryClient, toast]
  );

  const connect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { account: connectedAccount, chainId: connectedChainId } =
        await web3Provider.connect();

      setAccount(connectedAccount);
      setChainId(connectedChainId);
      setIsConnected(true);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`,
      });
    } catch (err: unknown) {
      const message = getWeb3ErrorMessage(err, "Failed to connect wallet");
      setError(message);
      toast({
        title: "Connection Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const switchToSepolia = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const newChainId = await web3Provider.switchToSepolia();
      setChainId(newChainId);
      await queryClient.invalidateQueries({ queryKey: ["polls"] });
      await queryClient.invalidateQueries({ queryKey: ["poll"] });

      toast({
        title: "Network Switched",
        description: "Switched to the Sepolia test network.",
      });
    } catch (err: unknown) {
      const message = getWeb3ErrorMessage(err, "Failed to switch to Sepolia network");
      setError(message);
      toast({
        title: "Network Switch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, toast]);

  // Check existing connection once on mount and subscribe to MetaMask events
  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const result = await web3Provider.connectSilent();
        if (isMounted && result) {
          setAccount(result.account);
          setChainId(result.chainId);
          setIsConnected(true);
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkConnection();

    const handleAccountsChanged = async (accountsArg: unknown) => {
      const accounts = Array.isArray(accountsArg) ? (accountsArg as string[]) : [];
      if (accounts.length === 0) {
        disconnect(true);
        return;
      }

      try {
        const result = await web3Provider.syncAccount(accounts[0]);
        if (isMounted) {
          setAccount(result.account);
          setChainId(result.chainId);
          setIsConnected(true);
          queryClient.invalidateQueries({ queryKey: ["polls"] });
          queryClient.invalidateQueries({ queryKey: ["poll"] });
        }
      } catch (err) {
        console.error("Failed to sync account change:", err);
      }
    };

    const handleChainChanged = async (chainHexArg: unknown) => {
      const parsedChainId =
        typeof chainHexArg === "string" ? parseInt(chainHexArg, 16) : NaN;

      try {
        const result = await web3Provider.connectSilent();
        if (!isMounted) return;

        if (result) {
          setAccount(result.account);
          setChainId(result.chainId);
          setIsConnected(true);
        } else if (!Number.isNaN(parsedChainId)) {
          setChainId(parsedChainId);
        }

        queryClient.invalidateQueries({ queryKey: ["polls"] });
        queryClient.invalidateQueries({ queryKey: ["poll"] });
      } catch (err) {
        console.error("Failed to handle chain change:", err);
      }
    };

    const ethereum = window.ethereum;
    ethereum?.on?.("accountsChanged", handleAccountsChanged);
    ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      isMounted = false;
      ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect, queryClient]);

  const getAllPolls = useCallback(async (): Promise<Poll[]> => {
    return web3Provider.getAllPolls();
  }, []);

  const getPoll = useCallback(async (pollId: number): Promise<Poll> => {
    return web3Provider.getPoll(pollId);
  }, []);

  const createPoll = useCallback(
    async (title: string, options: string[]): Promise<Transaction> => {
      return web3Provider.createPoll(title, options);
    },
    []
  );

  const vote = useCallback(
    async (pollId: number, optionIndex: number): Promise<Transaction> => {
      return web3Provider.vote(pollId, optionIndex);
    },
    []
  );

  const endPoll = useCallback(async (pollId: number): Promise<Transaction> => {
    return web3Provider.endPoll(pollId);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        hasWallet,
        isConnected,
        account,
        chainId,
        isWrongNetwork,
        isLoading,
        error,
        connect,
        disconnect: () => disconnect(false),
        switchToSepolia,
        getAllPolls,
        getPoll,
        createPoll,
        vote,
        endPoll,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
