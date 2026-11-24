import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/useWeb3";
import { Link } from "react-router-dom";
import { WalletIcon, PlusIcon, BarChart, AlertTriangle } from "lucide-react";

export function Header() {
  const {
    isConnected,
    account,
    isWrongNetwork,
    connect,
    disconnect,
    switchToSepolia,
    isLoading,
  } = useWeb3();

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="border-b sticky top-0 z-10 bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent gradient-bg">PollVerse</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium hover:text-primary">
            Polls
          </Link>
          <Link to="/create" className="text-sm font-medium hover:text-primary">
            Create Poll
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {isConnected ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {isWrongNetwork && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={switchToSepolia}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Switch to Sepolia</span>
                </Button>
              )}
              <span className="text-sm hidden md:block">
                {account && truncateAddress(account)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isLoading}
              size="sm"
              className="gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
            </Button>
          )}

          <Link to="/create" aria-label="Create Poll">
            <Button size="sm" className="gap-2">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Create Poll</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
