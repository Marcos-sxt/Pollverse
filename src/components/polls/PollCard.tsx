
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Poll } from "@/lib/web3";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Unlock } from "lucide-react";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg mr-4">{poll.title}</CardTitle>
          <Badge variant={poll.active ? "secondary" : "outline"}>
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
        <CardDescription>Poll #{poll.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {poll.optionNames && poll.optionNames.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground mb-2">
              {poll.optionNames.length} options available
            </p>
            <ul className="text-sm list-disc list-inside">
              {poll.optionNames.slice(0, 3).map((option, index) => (
                <li key={index} className="truncate">
                  {option}
                </li>
              ))}
              {poll.optionNames.length > 3 && (
                <li className="text-muted-foreground">
                  +{poll.optionNames.length - 3} more options
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading poll details...</p>
        )}
      </CardContent>
      <CardFooter>
        <Link to={`/poll/${poll.id}`} className="w-full">
          <Button variant="outline" className="w-full gap-1">
            <span>View Poll</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
