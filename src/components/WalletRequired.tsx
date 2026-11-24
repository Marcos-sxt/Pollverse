import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/useWeb3";
import { AlertTriangle, ExternalLink, WalletIcon } from "lucide-react";

interface WalletRequiredProps {
  children: React.ReactNode;
}

export function WalletRequired({ children }: WalletRequiredProps) {
  const { hasWallet, isConnected, isWrongNetwork, connect, switchToSepolia, isLoading } = useWeb3();

  if (!hasWallet) {
    return (
      <div className="flex justify-center items-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>MetaMask Required</CardTitle>
            <CardDescription>
              Install MetaMask or another Ethereum wallet extension to view and interact with PollVerse polls on Sepolia.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="gap-2">
              <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span>Install MetaMask</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={connect} disabled={isLoading} className="gap-2">
              <WalletIcon className="h-4 w-4" />
              <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="flex justify-center items-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Wrong Network</CardTitle>
            </div>
            <CardDescription>
              PollVerse runs on the Ethereum Sepolia test network. Switch networks in your wallet to load and vote on polls.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={switchToSepolia} disabled={isLoading} className="gap-2">
              <span>{isLoading ? "Switching..." : "Switch to Sepolia"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
