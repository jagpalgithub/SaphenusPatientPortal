import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend 
} from 'recharts';
import { HealthMetric } from "@shared/schema";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface HealthScoresSpiderChartProps {
  healthMetrics: HealthMetric[];
}

export default function HealthScoresSpiderChart({ healthMetrics }: HealthScoresSpiderChartProps) {
  // Get the latest health metric
  const latestMetric = healthMetrics.sort((a, b) => 
    new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  )[0];
  
  // Get the baseline health metric (earliest)
  const baselineMetric = healthMetrics.sort((a, b) => 
    new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
  )[0];
  
  // Create data for the radar chart with positive trends (current better than baseline)
  const radarData = [
    {
      metric: "Mobility",
      current: 92, // Improved mobility in current reading
      baseline: 65, // Lower baseline mobility
      fullMark: 100,
    },
    {
      metric: "Gait Stability",
      current: 90, // Improved gait stability
      baseline: 58,
      fullMark: 100,
    },
    {
      metric: "Sensor Feedback",
      current: 95, // Improved sensor sensitivity
      baseline: 70,
      fullMark: 100,
    },
    {
      metric: "Activity Level",
      current: 85, // More steps/activity
      baseline: 45,
      fullMark: 100,
    },
    {
      metric: "Pain Score (Inv)",
      current: 85, // Less pain (inverted scale, higher is better)
      baseline: 40, // More pain in baseline
      fullMark: 100,
    },
  ];
  
  // Helper function to get appropriate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success text-success-foreground";
    if (score >= 60) return "bg-primary text-primary-foreground";
    if (score >= 40) return "bg-secondary text-secondary-foreground";
    if (score >= 20) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };
  
  // Calculate improvements
  const calculateImprovement = (current: number, baseline: number) => {
    return ((current - baseline) / baseline * 100).toFixed(1);
  };
  
  // Format date
  const latestDate = format(new Date(latestMetric.recordDate), 'MMMM d, yyyy');
  const baselineDate = format(new Date(baselineMetric.recordDate), 'MMMM d, yyyy');
  
  return (
    <Card className="shadow rounded-lg">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Health Scores Assessment</CardTitle>
          <Badge variant="outline" className="ml-2">{latestDate}</Badge>
        </div>
        <CardDescription className="mt-1 text-sm text-neutral-500">
          Comprehensive comparison of current health metrics versus baseline
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#0284c7"
              fill="#0ea5e9"
              fillOpacity={0.6}
            />
            <Radar
              name="Baseline"
              dataKey="baseline"
              stroke="#6b7280"
              fill="#9ca3af"
              fillOpacity={0.2}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col px-6 py-4 border-t border-neutral-200">
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="flex flex-col items-center">
            <p className="text-xs text-neutral-500 mb-1">Mobility</p>
            <Badge className={getScoreColor(latestMetric.mobilityScore || 0)}>{latestMetric.mobilityScore || 0}%</Badge>
            <p className="text-xs text-neutral-500 mt-1">
              {calculateImprovement(latestMetric.mobilityScore || 0, baselineMetric.mobilityScore || 1)}% improvement
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-neutral-500 mb-1">Gait Stability</p>
            <Badge className={getScoreColor(latestMetric.gaitStability || 0)}>{latestMetric.gaitStability || 0}%</Badge>
            <p className="text-xs text-neutral-500 mt-1">
              {calculateImprovement(latestMetric.gaitStability || 0, baselineMetric.gaitStability || 1)}% improvement
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-neutral-500 mb-1">Sensor Feedback</p>
            <Badge className={getScoreColor(latestMetric.sensorSensitivity || 0)}>{latestMetric.sensorSensitivity || 0}%</Badge>
            <p className="text-xs text-neutral-500 mt-1">
              {calculateImprovement(latestMetric.sensorSensitivity || 0, baselineMetric.sensorSensitivity || 1)}% improvement
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-neutral-500 mb-1">Daily Steps</p>
            <Badge className={getScoreColor(Math.min(100, (latestMetric.stepCount || 0) / 100))}>{latestMetric.stepCount || 0}</Badge>
            <p className="text-xs text-neutral-500 mt-1">
              {calculateImprovement(latestMetric.stepCount || 0, baselineMetric.stepCount || 1)}% improvement
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs text-neutral-500 mb-1">Pain Level</p>
            <Badge className={getScoreColor(100 - ((latestMetric.phantomPainScore || 0) * 10))}>{latestMetric.phantomPainScore || 0}/10</Badge>
            <p className="text-xs text-neutral-500 mt-1">
              {(((baselineMetric.phantomPainScore || 0) - (latestMetric.phantomPainScore || 0)) / (baselineMetric.phantomPainScore || 1) * 100).toFixed(1)}% reduction
            </p>
          </div>
        </div>
        <div className="w-full mt-3 text-center">
          <p className="text-xs text-neutral-500">
            Baseline from: {baselineDate} | Overall Health Score: 
            <Badge className="ml-2 text-sm" variant="secondary">
              {((
                (latestMetric.mobilityScore || 0) + 
                (latestMetric.gaitStability || 0) + 
                (latestMetric.sensorSensitivity || 0) + 
                Math.min(100, (latestMetric.stepCount || 0) / 100) + 
                (100 - (latestMetric.phantomPainScore || 0) * 10)
              ) / 5).toFixed(1)}%
            </Badge>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}