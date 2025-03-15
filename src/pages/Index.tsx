
import { PollList } from "@/components/polls/PollList";
import { WalletRequired } from "@/components/WalletRequired";

const Index = () => {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Welcome to <span className="bg-clip-text text-transparent gradient-bg">PollVerse</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Create, vote, and explore decentralized polls on the blockchain
        </p>
      </div>
      
      <WalletRequired>
        <PollList />
      </WalletRequired>
    </div>
  );
};

export default Index;
