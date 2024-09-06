import 'server-only';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Building2, User2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useTranslation } from '@/i18n/index';
import Language from '../admin/(dashboard)/language';

export default async function LoginPage({
  params: { lng }
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng);

  return (
    <>
      <div className="min-h-screen flex justify-center items-center p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className={`flex flex-col w-full space-y-[10px]`}>
              <CardTitle className="text-2xl">{t('Login')}</CardTitle>
              <CardDescription>
                {t('If you have an account, please sign in.')}
              </CardDescription>
              <Link className={`w-full space-y-[10px]`} href={`/${lng}/signIn`}>
                <Button className="w-full">{t('Sign in')}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardFooter>
            <div className={`flex flex-col w-full space-y-[10px]`}>
              <CardDescription>{t('Or create a new account.')}</CardDescription>
              <Link href={`/${lng}/register/admin`}>
                <Button className="flex items-center justify-center w-full gap-2">
                  <Building2 className="mr-auto"></Building2>
                  <span className="text-center w-full">
                    {t('I am an admin')}
                  </span>
                </Button>
              </Link>
              <Link href={`/${lng}/register/user`}>
                <Button className="flex items-center justify-center w-full gap-2">
                  <User2 className="mr-auto"></User2>
                  <span className="text-center w-full">{t('I am a user')}</span>
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="fixed bottom-4 right-4">
        <Language lng={lng} labelVisible={true} />
      </div>
    </>
  );
}
