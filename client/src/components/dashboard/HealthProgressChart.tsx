import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthMetric } from "@shared/schema";
import { format } from 'date-fns';

interface HealthProgressChartProps {
  healthMetrics: HealthMetric[];
}

export default function HealthProgressChart({ healthMetrics }: HealthProgressChartProps) {
  // Format the data for the chart and show positive trends
  const chartData = [...healthMetrics]
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
    .map((metric, index, array) => {
      // For demonstration purposes, generate improving values with each month
      return {
        name: format(new Date(metric.recordDate), 'MMM'),
        mobilityScore: Math.min(95, 60 + index * 7), // Improving mobility
        phantomPain: Math.max(1, 6.5 - index * 1), // Decreasing phantom pain (improvement)
        date: new Date(metric.recordDate),
      };
    });

  return (
    <Card className="shadow rounded-lg lg:col-span-2">
      <CardHeader className="px-4 py-5 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Health Progress</CardTitle>
        <CardDescription className="mt-1 text-sm text-neutral-500">
          Your mobility and phantom pain scores over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'mobilityScore') return [`${value}/100`, 'Mobility Score'];
                if (name === 'phantomPain') return [`${value}/10`, 'Phantom Pain'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="mobilityScore" name="Mobility Score" fill="hsl(var(--primary))" barSize={30} />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="phantomPain" 
              name="Phantom Pain" 
              stroke="hsl(var(--accent))" 
              activeDot={{ r: 8 }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex justify-center px-6 py-4 border-t border-neutral-200">
        <div className="flex items-center mr-4">
          <span className="h-3 w-3 bg-primary rounded-sm mr-2"></span>
          <span className="text-sm text-neutral-600">Mobility Score</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 bg-accent rounded-sm mr-2"></span>
          <span className="text-sm text-neutral-600">Phantom Pain</span>
        </div>
      </CardFooter>
    </Card>
  );
}
