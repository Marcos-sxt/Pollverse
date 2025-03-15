
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/hooks/useWeb3";
import { WalletIcon } from "lucide-react";

interface WalletRequiredProps {
  children: React.ReactNode;
}

export function WalletRequired({ children }: WalletRequiredProps) {
  const { isConnected, connect, isLoading } = useWeb3();

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

  return <>{children}</>;
}
