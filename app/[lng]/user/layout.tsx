import 'server-only';

export const dynamic = 'force-dynamic';

import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useTranslation } from '@/i18n/index';
import Language from '../admin/(dashboard)/language';
import Logo from '@/public/logo_72ppi.png';

export default async function DashboardLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng);
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <header
            className="sticky top-0 z-30 flex h-14 justify-between
          items-center gap-4 border-b bg-background px-4
          sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  src={Logo}
                  alt={'website logo'}
                  width={30}
                  height={30}
                />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-start space-x-6 p-5">
                    <Image
                      src={Logo}
                      alt={'website logo'}
                      width={72}
                      height={72}
                    />
                    <div className="flex flex-col space-y-3">
                      <DialogTitle>Quickz</DialogTitle>
                      <DialogDescription className="text-muted-foreground whitespace-pre-wrap">
                        Version 1.0.0 <br />
                        Developed by Jason Fu
                      </DialogDescription>
                      <DialogDescription className="text-muted-foreground whitespace-pre-wrap">
                        {t('Introduction')}{' '}
                        <a
                          href={'https://github.com/Jason-Fu-git/quickz_pub'}
                          className="text-blue-700 underline"
                        >
                          {t('Source Code')}
                        </a>
                      </DialogDescription>
                      <DialogDescription>
                        {t('sensitive info')}
                      </DialogDescription>
                      <DialogDescription>
                        {t('individual use')}
                      </DialogDescription>
                      <DialogDescription>
                        MIT LICENSE. Copyright (c) 2024 Jason Fu, Inc.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <div className="ml-auto flex space-x-4">
              <Language lng={lng} labelVisible={true} />
              <User lng={lng} />
            </div>
          </header>
          <main
            className="grid flex-1 items-start gap-2 p-4
          sm:px-6 sm:py-0 md:gap-4 bg-muted/40"
          >
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}
