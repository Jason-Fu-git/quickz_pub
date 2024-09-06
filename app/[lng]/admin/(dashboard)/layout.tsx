import 'server-only';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  LibraryBig,
  Users2,
  Info,
  Languages
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { User } from './user';
import Providers from './providers';
import { NavItem } from './nav-item';
import { SearchInput } from './search';
import DashboardBreadcrumb from './breadcrumb';
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
import React from 'react';
import Language from './language';
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
        <DesktopNav lng={lng} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav lng={lng} />
            <DashboardBreadcrumb />
            <div className="flex space-x-4 ml-auto items-center justify-center">
              <Language lng={lng} labelVisible={true} />
              <User lng={lng} />
            </div>
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

async function DesktopNav({ lng }: { lng: string }) {
  const { t } = await useTranslation(lng);
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Image
          src={Logo}
          alt={'website logo'}
          width={25}
          height={25}
        />

        <NavItem href={`/${lng}/admin`} label={t('Home')}>
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href={`/${lng}/admin/members`} label={t('Members')}>
          <Users2 className="h-5 w-5" />
        </NavItem>

        <NavItem href={`/${lng}/admin/questions`} label={t('Question Bank')}>
          <LibraryBig className="h-5 w-5" />
        </NavItem>
      </nav>

      <Dialog>
        <nav className="mt-auto flex flex-col items-center gap-6 px-2 sm:py-5">
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <div>
                  <Info className="h-5 w-5" />
                  <span className="sr-only"></span>
                </div>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent side="right">{t('About')}</TooltipContent>
          </Tooltip>
        </nav>
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
                <DialogDescription>{t('sensitive info')}</DialogDescription>
                <DialogDescription>{t('individual use')}</DialogDescription>
                <DialogDescription>
                  MIT LICENSE. Copyright (c) 2024 Jason Fu, Inc.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

async function MobileNav({ lng }: { lng: string }) {
  const { t } = await useTranslation(lng);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <div className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
            <Image
              src={Logo}
              alt={'website logo'}
              width={35}
              height={35}
              className="hover:scale-110"
            />
            <span className="sr-only">Quickz</span>
          </div>
          <Link
            href={`/${lng}/admin`}
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            {t('Home')}
          </Link>
          <Link
            href={`/${lng}/admin/members`}
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Users2 className="h-5 w-5" />
            {t('Members')}
          </Link>
          <Link
            href={`/${lng}/admin/questions`}
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <LibraryBig className="h-5 w-5" />
            {t('Question Bank')}
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                <Info className="h-5 w-5" />
                {t('About')}
              </div>
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
                    <DialogDescription>{t('sensitive info')}</DialogDescription>
                    <DialogDescription>{t('individual use')}</DialogDescription>
                    <DialogDescription>
                      MIT LICENSE. Copyright (c) 2024 Jason Fu, Inc.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
