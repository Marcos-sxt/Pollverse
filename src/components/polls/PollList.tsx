import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PollCard } from "./PollCard";
import { Poll } from "@/lib/web3";
import { useWeb3 } from "@/hooks/useWeb3";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export function PollList() {
  const { getAllPolls, getPoll } = useWeb3();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Use React Query to fetch and cache polls with a stable key and function
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ["polls"],
    queryFn: async () => {
      const pollsData = await getAllPolls();
      const detailedPolls = await Promise.all(
        pollsData.map(async (poll) => {
          try {
            return await getPoll(poll.id);
          } catch (error) {
            console.error(`Error fetching details for poll ${poll.id}:`, error);
            return poll; // Return basic poll if fetching details fails
          }
        })
      );
      return detailedPolls;
    },
    staleTime: 1 * 60 * 1000, // Cache data for 1 minutes
  });

  // Filter polls based on search term and active status
  const filteredPolls = polls?.filter((poll) => {
    const matchesTerm = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "active") {
      return matchesTerm && poll.active;
    } else if (filter === "ended") {
      return matchesTerm && !poll.active;
    }
    return matchesTerm;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Polls</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              id="search"
              type="search"
              placeholder="Search by title..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Filter by Status</Label>
          <RadioGroup 
            defaultValue="all" 
            className="flex gap-4"
            value={filter}
            onValueChange={setFilter}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ended" id="ended" />
              <Label htmlFor="ended">Ended</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              className="h-[200px] rounded-lg bg-muted animate-pulse-slow"
            />
          ))}
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No polls found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || filter !== "all" 
              ? "Try adjusting your search or filter"
              : "Create your first poll to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
