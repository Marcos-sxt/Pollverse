import { ethers } from "ethers";

// Poll Contract ABI
export const POLL_ABI = [
  "function createPoll(string memory _title, string[] memory _options) external",
  "function vote(uint256 _pollId, uint256 _optionIndex) external",
  "function endPoll(uint256 _pollId) external",
  "function getPoll(uint256 _pollId) external view returns(string memory title, bool active, string[] memory optionNames, uint256[] memory optionVotes)",
  "function getAllPolls() external view returns (uint256[] memory pollIds, string[] memory titles)",
  "function getPollCreator(uint256 _pollId) external view returns (address)",
];

// Deployed PollVerse contract address on Ethereum Sepolia testnet
export const POLL_CONTRACT_ADDRESS = "0xBD22783c0905fa1c829baf4f6D047e823D4bFC6A";

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = "0xaa36a7";

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

// Types
export interface Poll {
  id: number;
  title: string;
  active: boolean;
  optionNames: string[];
  optionVotes: number[];
  creator?: string;
}

export interface Transaction {
  hash: string;
  wait: () => Promise<ethers.providers.TransactionReceipt>;
}

interface EthersLikeError {
  code?: number | string;
  reason?: string;
  message?: string;
  data?: { message?: string };
  error?: { message?: string; data?: { message?: string } };
}

export function getWeb3ErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const err = error as EthersLikeError;
  if (err.code === 4001 || err.code === "ACTION_REJECTED") {
    return "Transaction or connection request was rejected in your wallet.";
  }

  const rawMessage =
    err.reason ||
    err.data?.message ||
    err.error?.data?.message ||
    err.error?.message ||
    err.message;

  if (!rawMessage) {
    return fallback;
  }

  // Strip noisy MetaMask/ethers execution reverted prefixes when present
  const revertedMatch = rawMessage.match(/execution reverted(?::\s*)?([^"(\n]+)/i);
  if (revertedMatch?.[1]?.trim()) {
    return revertedMatch[1].trim();
  }

  return rawMessage;
}

// Web3 Provider Connector
class Web3ProviderConnector {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private account: string | null = null;
  private chainId: number | null = null;

  private initializeWithAccount = async (account: string): Promise<void> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new ethers.providers.Web3Provider(
      window.ethereum as ethers.providers.ExternalProvider,
      "any"
    );
    this.signer = this.provider.getSigner(account);
    this.account = account;

    const network = await this.provider.getNetwork();
    this.chainId = network.chainId;

    this.contract = new ethers.Contract(
      POLL_CONTRACT_ADDRESS,
      POLL_ABI,
      this.signer
    );
  };

  // Interactive connect (prompts MetaMask)
  connect = async (): Promise<{ account: string; chainId: number }> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }

    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error("No wallet accounts available.");
    }

    await this.initializeWithAccount(accounts[0]);
    return {
      account: this.account!,
      chainId: this.chainId!,
    };
  };

  // Silent connect (checks already authorized accounts without prompting)
  connectSilent = async (): Promise<{ account: string; chainId: number } | null> => {
    if (!window.ethereum) {
      return null;
    }

    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
      this.disconnect();
      return null;
    }

    await this.initializeWithAccount(accounts[0]);
    return {
      account: this.account!,
      chainId: this.chainId!,
    };
  };

  // Sync provider/signer when MetaMask switches accounts or networks
  syncAccount = async (account: string): Promise<{ account: string; chainId: number }> => {
    await this.initializeWithAccount(account);
    return {
      account: this.account!,
      chainId: this.chainId!,
    };
  };

  // Switch MetaMask to Ethereum Sepolia testnet
  switchToSepolia = async (): Promise<number> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_HEX }],
      });
    } catch (error) {
      const err = error as EthersLikeError;
      // 4902 = chain not yet added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_HEX,
              chainName: "Sepolia Test Network",
              nativeCurrency: {
                name: "SepoliaETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw error;
      }
    }

    if (this.account) {
      await this.initializeWithAccount(this.account);
    }

    return SEPOLIA_CHAIN_ID;
  };

  // Check if the wallet is connected
  isConnected = (): boolean => {
    return !!this.account;
  };

  // Get the connected account
  getAccount = (): string | null => {
    return this.account;
  };

  // Get the connected chain ID
  getChainId = (): number | null => {
    return this.chainId;
  };

  // Disconnect
  disconnect = (): void => {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.chainId = null;
  };

  private ensureContractReady = (): ethers.Contract => {
    if (!this.contract) {
      throw new Error("Wallet is not connected.");
    }
    if (this.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error("Please switch your wallet to the Sepolia test network.");
    }
    return this.contract;
  };

  // Get all polls
  getAllPolls = async (): Promise<Poll[]> => {
    const contract = this.ensureContractReady();

    try {
      const [pollIds, titles] = await contract.getAllPolls();

      const polls: Poll[] = [];
      for (let i = 0; i < pollIds.length; i++) {
        polls.push({
          id: pollIds[i].toNumber(),
          title: titles[i],
          active: false,
          optionNames: [],
          optionVotes: [],
        });
      }

      return polls;
    } catch (error) {
      console.error("Error getting all polls:", error);
      throw error;
    }
  };

  // Get a specific poll
  getPoll = async (pollId: number): Promise<Poll> => {
    const contract = this.ensureContractReady();

    try {
      const [[title, active, optionNames, optionVotes], creator] = await Promise.all([
        contract.getPoll(pollId),
        contract.getPollCreator(pollId),
      ]);

      const voteCounts = optionVotes.map((vote: ethers.BigNumber) => vote.toNumber());

      return {
        id: pollId,
        title,
        active,
        optionNames,
        optionVotes: voteCounts,
        creator,
      };
    } catch (error) {
      console.error(`Error getting poll ${pollId}:`, error);
      throw error;
    }
  };

  // Create a new poll
  createPoll = async (title: string, options: string[]): Promise<Transaction> => {
    const contract = this.ensureContractReady();

    try {
      const tx = await contract.createPoll(title, options);
      return tx;
    } catch (error) {
      console.error("Error creating poll:", error);
      throw error;
    }
  };

  // Vote in a poll
  vote = async (pollId: number, optionIndex: number): Promise<Transaction> => {
    const contract = this.ensureContractReady();

    try {
      const tx = await contract.vote(pollId, optionIndex);
      return tx;
    } catch (error) {
      console.error(`Error voting in poll ${pollId}:`, error);
      throw error;
    }
  };

  // End a poll
  endPoll = async (pollId: number): Promise<Transaction> => {
    const contract = this.ensureContractReady();

    try {
      const tx = await contract.endPoll(pollId);
      return tx;
    } catch (error) {
      console.error(`Error ending poll ${pollId}:`, error);
      throw error;
    }
  };
}

// Create and export a singleton instance
export const web3Provider = new Web3ProviderConnector();

// Add TypeScript type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
