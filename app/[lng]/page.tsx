'use client';

import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/i18n/client';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

import Logo from '@/public/logo_72ppi.png';

export default function IndexPage({ params: { lng } }) {
  const router = useRouter();
  const { t } = useTranslation(lng);

  const checkSession = async () => {
    const session = await getSession();
    if (session) {
      let user = session?.user;
      if (user && user.name) {
        // get user info
        const response = await fetch(
          `/api/user?name=${encodeURIComponent(user.name)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data === null) {
            router.push(`/${lng}/login`);
            return;
          }
          if (data.privileges === 'admin') {
            router.push(`/${lng}/admin`);
            return;
          }
          router.push(`/${lng}/user`);
          return;
        } else {
          throw new Error(`User not found`);
        }
      } else {
        throw new Error(`User not found`);
      }
    }
    router.push(`/${lng}/login`);
    return;
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div>
      <div className="min-h-screen flex flex-col justify-between items-center p-8 gap-5">
        <div className="flex flex-col flex-grow items-center gap-5 justify-center">
          <div className="hidden items-center md:flex gap-10 ">
            <Image src={Logo} alt={'website logo'} width={100} height={100} />
            <h1 className="text-6xl font-bold">Quickz</h1>
          </div>
          <div className="flex items-center md:hidden gap-8 ">
            <Image src={Logo} alt={'website logo'} width={80} height={80} />
            <h1 className="text-4xl font-bold">Quickz</h1>
          </div>
          <Label className="font-normal text-gray-600">
            Copyright © Jason Fu 2024
          </Label>
        </div>
        <span className="mt-auto text-center text-sm">
          {t('redirect hint')}{' '}
          <a href={`/${lng}/login`} className="text-blue-700 underline">
            {t('manual redirect')}
          </a>
        </span>
      </div>
    </div>
  );
}
