
import { PollDetail } from "@/components/polls/PollDetail";
import { WalletRequired } from "@/components/WalletRequired";

const PollPage = () => {
  return (
    <WalletRequired>
      <PollDetail />
    </WalletRequired>
  );
};

export default PollPage;
