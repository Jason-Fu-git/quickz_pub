'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { useTranslation } from '@/i18n/client';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex justify-center items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex">
          <div className="flex items-center justify-center text-xl font-semibold space-x-4">
            <h1 className="h-full whitespace-nowrap">500 |</h1>
            <p className="text-gray-700 h-full text-md font-normal">
              {'Internal server error'}
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
