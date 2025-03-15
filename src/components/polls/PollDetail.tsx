import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Poll } from "@/lib/web3";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const pollId = parseInt(id || "0");
  const navigate = useNavigate();
  const { getPoll, vote, endPoll, account } = useWeb3();
  const { toast } = useToast();

  // Additional state variables to manage voting and ending actions
  const [voting, setVoting] = useState(false);
  const [ending, setEnding] = useState(false);

  // Use React Query to fetch poll data
  const { data: poll, isLoading, refetch } = useQuery<Poll>({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      const fetchedPoll = await getPoll(pollId);
      return fetchedPoll;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  // Derived values: total votes and checking if user has voted (from localStorage)
  const totalVotes = poll ? poll.optionVotes.reduce((sum, votes) => sum + votes, 0) : 0;
  const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
  const hasVoted = poll ? votedPolls.includes(pollId) : false;

  // Handle voting
  const handleVote = async (optionIndex: number) => {
    if (!poll || !poll.active) return;

    try {
      setVoting(true);
      const tx = await vote(pollId, optionIndex);
      await tx.wait();

      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully!",
      });

      // Save pollId as voted in localStorage
      const updatedVotedPolls = [...votedPolls, pollId];
      localStorage.setItem("votedPolls", JSON.stringify(updatedVotedPolls));

      // Refetch poll data to update vote counts
      await refetch();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Voting Failed",
        description: "There was an error submitting your vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  // Handle ending poll
  const handleEndPoll = async () => {
    if (!poll) return;

    try {
      setEnding(true);
      const tx = await endPoll(pollId);
      await tx.wait();

      toast({
        title: "Poll Ended",
        description: "The poll has been closed successfully!",
      });

      // Refetch poll data to update poll status
      await refetch();
    } catch (error) {
      console.error("Error ending poll:", error);
      toast({
        title: "Action Failed",
        description: "There was an error ending the poll",
        variant: "destructive",
      });
    } finally {
      setEnding(false);
    }
  };

  // Determine if the current account is the poll creator
  const isCreator =
    poll?.creator && account && poll.creator.toLowerCase() === account.toLowerCase();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div className="rounded-lg h-[400px] bg-muted animate-pulse-slow" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Poll Not Found</CardTitle>
            <CardDescription>
              The poll you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")}>Go to Polls</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{poll.title}</CardTitle>
                  <CardDescription>Poll #{poll.id}</CardDescription>
                </div>

                <Badge
                  variant={poll.active ? "secondary" : "outline"}
                  className="whitespace-nowrap"
                >
                  {poll.active ? (
                    <div className="flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Ended</span>
                    </div>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Voting Options</h3>
                <div className="space-y-4">
                  {poll.optionNames.map((option, index) => {
                    const voteCount = poll.optionVotes[index] || 0;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{option}</span>
                          <span>
                            {voteCount} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Votes: {totalVotes}
                </p>
                {isCreator && (
                  <p className="text-xs text-primary">You created this poll</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                {poll.active
                  ? "Select an option to vote"
                  : "This poll has ended and is no longer accepting votes"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {poll.active ? (
                hasVoted ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Thank you for voting!</p>
                  </div>
                ) : (
                  poll.optionNames.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      disabled={voting || !poll.active}
                      onClick={() => handleVote(index)}
                    >
                      {option}
                    </Button>
                  ))
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    This poll has ended and is no longer accepting votes.
                  </p>
                </div>
              )}
            </CardContent>

            {isCreator && poll.active && (
              <CardFooter className="border-t pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={ending}
                  onClick={handleEndPoll}
                >
                  {ending ? "Ending Poll..." : "End Poll"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
