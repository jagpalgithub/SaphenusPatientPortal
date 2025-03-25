import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Update } from "@shared/schema";
import { FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface ActivityFeedProps {
  updates: Update[];
}

export default function ActivityFeed({ updates }: ActivityFeedProps) {
  const getSourceIcon = (update: Update) => {
    if (update.sourceType === "medical_staff") {
      return (
        <Avatar className="h-10 w-10">
          <AvatarImage src={update.sourceImage || undefined} alt={update.sourceName} />
          <AvatarFallback>{update.sourceName?.charAt(0)}</AvatarFallback>
        </Avatar>
      );
    } else if (update.type === "prescription_update") {
      return (
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <FileText className="h-6 w-6 text-white" />
        </div>
      );
    } else if (update.type === "system_calibration") {
      return (
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    return (
      <Avatar className="h-10 w-10">
        <AvatarFallback>{update.sourceName?.charAt(0)}</AvatarFallback>
      </Avatar>
    );
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Latest Updates</CardTitle>
        <CardDescription className="mt-1 text-sm text-neutral-500">
          Recent activity and feedback from your care team.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-neutral-200 overflow-hidden">
          {updates.map((update) => (
            <li key={update.id} className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getSourceIcon(update)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium text-neutral-900">{update.sourceName}</div>
                  <div className="mt-1 text-sm text-neutral-700">
                    {update.content}
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    {format(new Date(update.timestamp), "MMMM d, yyyy • h:mm a")}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-neutral-200 px-4 py-4">
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-light">
          View all updates
        </a>
      </CardFooter>
    </Card>
  );
}
