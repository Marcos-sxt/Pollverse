import { ethers } from "ethers";

// Poll Contract ABI
export const POLL_ABI = [
  "function createPoll(string memory _title, string[] memory _options) external",
  "function vote(uint256 _pollId, uint256 _optionIndex) external",
  "function endPoll(uint256 _pollId) external",
  "function getPoll(uint256 _pollId) external view returns(string memory title, bool active, string[] memory optionNames, uint256[] memory optionVotes)",
  "function getAllPolls() external view returns (uint256[] memory pollIds, string[] memory titles)",
  "function getPollCreator(uint256 _pollId) external view returns (address)"
];

// This should be replaced with the actual deployed contract address
export const POLL_CONTRACT_ADDRESS = "0xBD22783c0905fa1c829baf4f6D047e823D4bFC6A";

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

// Web3 Provider Connector
class Web3Provider {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private account: string | null = null;

  // Initialize provider
  connect = async (): Promise<string | null> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Get the provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get the signer
      this.signer = this.provider.getSigner();
      
      // Set the account
      this.account = accounts[0];
      
      // Create the contract instance
      this.contract = new ethers.Contract(
        POLL_CONTRACT_ADDRESS, 
        POLL_ABI, 
        this.signer
      );
      
      return this.account;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return null;
    }
  };

  // Check if the wallet is connected
  isConnected = (): boolean => {
    return !!this.account;
  };

  // Get the connected account
  getAccount = (): string | null => {
    return this.account;
  };

  // Disconnect
  disconnect = (): void => {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  };

  // Get all polls
  getAllPolls = async (): Promise<Poll[]> => {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [pollIds, titles] = await this.contract.getAllPolls();
      
      // Map the results into a more useful format
      const polls: Poll[] = [];
      
      for (let i = 0; i < pollIds.length; i++) {
        polls.push({
          id: pollIds[i].toNumber(),
          title: titles[i],
          active: false, // We don't know the status yet
          optionNames: [],
          optionVotes: []
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
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      // Get poll data
      const [title, active, optionNames, optionVotes] = await this.contract.getPoll(pollId);
      
      // Get poll creator
      const creator = await this.contract.getPollCreator(pollId);
      
      // Convert BigNumber vote counts to numbers
      const voteCounts = optionVotes.map((vote: ethers.BigNumber) => vote.toNumber());
      
      return {
        id: pollId,
        title,
        active,
        optionNames,
        optionVotes: voteCounts,
        creator
      };
    } catch (error) {
      console.error(`Error getting poll ${pollId}:`, error);
      throw error;
    }
  };

  // Create a new poll
  createPoll = async (title: string, options: string[]): Promise<Transaction> => {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.createPoll(title, options);
      return tx;
    } catch (error) {
      console.error("Error creating poll:", error);
      throw error;
    }
  };

  // Vote in a poll
  vote = async (pollId: number, optionIndex: number): Promise<Transaction> => {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.vote(pollId, optionIndex);
      return tx;
    } catch (error) {
      console.error(`Error voting in poll ${pollId}:`, error);
      throw error;
    }
  };

  // End a poll
  endPoll = async (pollId: number): Promise<Transaction> => {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.endPoll(pollId);
      return tx;
    } catch (error) {
      console.error(`Error ending poll ${pollId}:`, error);
      throw error;
    }
  };
}

// Create and export a singleton instance
export const web3Provider = new Web3Provider();

// Add TypeScript type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
