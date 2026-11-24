import { useContext } from "react";
import { Web3Context, Web3ContextValue } from "@/context/web3-context";

export function useWeb3(): Web3ContextValue {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
