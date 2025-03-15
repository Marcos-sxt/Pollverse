
import { CreatePollForm } from "@/components/polls/CreatePollForm";
import { WalletRequired } from "@/components/WalletRequired";

const CreatePollPage = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <WalletRequired>
        <CreatePollForm />
      </WalletRequired>
    </div>
  );
};

export default CreatePollPage;
