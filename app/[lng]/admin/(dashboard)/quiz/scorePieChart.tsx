'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useTranslation } from '@/i18n/client';

export function ScorePieChart({
  scores,
  lng
}: {
  scores: number[];
  lng: string;
}) {
  const { t } = useTranslation(lng);

  const chartConfig = {
    num: {
      label: 'Number'
    },
    _null: {
      label: t('Not completed'),
      color: 'hsl(var(--chart-3))'
    },
    _0_59: {
      label: '0~59',
      color: 'hsl(var(--chart-1))'
    },
    _60_79: {
      label: '60~79',
      color: 'hsl(var(--chart-5))'
    },
    _80_99: {
      label: '80~99',
      color: 'hsl(var(--chart-4))'
    },
    _100: {
      label: '100',
      color: 'hsl(var(--chart-2))'
    }
  } satisfies ChartConfig;

  // categorize scores
  let _null_num = 0;
  let _0_59_num = 0;
  let _60_79_num = 0;
  let _80_99_num = 0;
  let _100_num = 0;

  scores.forEach((score) => {
    if (score < 0) _null_num++;
    else if (score < 60) _0_59_num++;
    else if (score < 80) _60_79_num++;
    else if (score < 100) _80_99_num++;
    else _100_num++;
  });

  const chartData = [
    { num: _null_num, fill: 'var(--color-_null)', label: '_null' },
    { num: _0_59_num, fill: 'var(--color-_0_59)', label: '_0_59' },
    { num: _60_79_num, fill: 'var(--color-_60_79)', label: '_60_79' },
    { num: _80_99_num, fill: 'var(--color-_80_99)', label: '_80_99' },
    { num: _100_num, fill: 'var(--color-_100)', label: '_100' }
  ];

  return (
    <Card className="flex flex-col m-2 min-w-[250px] min-h-[300px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('Score Distribution')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart width={250} height={250}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="num" nameKey="label" />
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
