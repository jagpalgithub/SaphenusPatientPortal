import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { HealthMetric } from "@shared/schema";

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  change?: number;
  changeText?: string;
  changeDirection?: "up" | "down" | "neutral";
  link?: string;
  linkText?: string;
}

export default function HealthMetricCard({
  title,
  value,
  previousValue,
  icon,
  iconBgColor,
  change,
  changeText,
  changeDirection = "neutral",
  link,
  linkText = "View history",
}: MetricCardProps) {
  const renderChangeIcon = () => {
    if (changeDirection === "up") {
      return <ChevronUp className="self-center flex-shrink-0 h-5 w-5 text-success" />;
    } else if (changeDirection === "down") {
      return <ChevronDown className="self-center flex-shrink-0 h-5 w-5 text-success" />;
    } else {
      return <Minus className="self-center flex-shrink-0 h-5 w-5 text-warning" />;
    }
  };

  const getChangeColor = () => {
    if (changeDirection === "up" || changeDirection === "down") {
      return "text-success";
    }
    return "text-warning";
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${iconBgColor}`}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
                <dd>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-neutral-900">{value}</div>
                    {change !== undefined && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                        {renderChangeIcon()}
                        <span className="sr-only">
                          {changeDirection === "up" ? "Increased by" : changeDirection === "down" ? "Decreased by" : "No change"}
                        </span>
                        {changeText || `${Math.abs(change)}%`}
                      </div>
                    )}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
      {link && (
        <CardFooter className="bg-neutral-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href={link} className="font-medium text-primary hover:text-primary-light">
              {linkText}
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
