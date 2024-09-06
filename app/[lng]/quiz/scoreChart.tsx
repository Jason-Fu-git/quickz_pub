'use client';

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

const chartConfig = {
  score: {
    label: 'Score'
  },
  red: {
    label: 'Red',
    color: 'hsl(var(--chart-1))'
  },
  green: {
    label: 'Green',
    color: 'hsl(var(--chart-2))'
  },
  yellow: {
    label: 'Yellow',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig;

export function ScoreChart({ score, time }: { score: number; time: Date }) {
  let chartData = [{ score: score, fill: 'var(--color-red)' }];

  if (score >= 60) {
    chartData = [{ score: score, fill: 'var(--color-yellow)' }];
  }

  if (score >= 80) {
    chartData = [{ score: score, fill: 'var(--color-green)' }];
  }

  return (
    <Card className="flex flex-col m-2 mb-5 min-w-[250px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Result</CardTitle>
        <CardDescription>{time.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] min-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={score * 3.6 + 90}
            innerRadius={80}
            outerRadius={110}
            width={250}
            height={250}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="score" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {score.toFixed(0).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          SCORE
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
