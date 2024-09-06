'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useTranslation } from '@/i18n/client';

export default function ErrorPage({
  params: { lng }
}: {
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);

  return (
    <div className="min-h-screen flex justify-center items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div
            className={`flex w-full space-x-[6px] items-center justify-center`}
          >
            <div className="items-center justify-center text-xl font-semibold">
              <h1 className="h-full whitespace-nowrap">
                ERROR |
              </h1>
            </div>
            <div className="items-center justify-center">
              <h5 className="text-gray-700 h-full text-md">
                {t('User not found or wrong password.')}
              </h5>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
