import 'server-only';
export const dynamic = 'force-dynamic';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn, providerMap } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/index';
import { Input } from '@/components/ui/input';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { cookies } from 'next/headers';

export default async function SignInPage({
  params: { lng }
}: {
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng);

  const csrfToken = cookies().get('authjs.csrf-token')?.value;
  console.log(csrfToken);

  return (
    <div className="min-h-screen flex justify-center items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className={`flex flex-col w-full space-y-[10px]`}>
            <CardTitle className="text-2xl">{t('Login')}</CardTitle>
            <CardDescription>
              {t('If you have an account, please sign in.')}
            </CardDescription>
          </div>
          <form
            action={async (formData) => {
              'use server';
              try {
                await signIn('credentials', formData);
              } catch (e) {
                if (e instanceof AuthError) {
                  return redirect(`/${lng}/login/error?type=${e.type}`);
                }
                throw e;
              }
            }}
            className="flex flex-col space-y-5"
          >
            <input type={'hidden'} name={'csrfToken'} value={csrfToken} />
            <div className="space-y-3">
              <Label htmlFor="username">{t('Username')}</Label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password">{t('Password')}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" value="Sign In">
              {t('Sign in')}
            </Button>
          </form>
        </CardHeader>

        <DialogFooter>
          {Object.values(providerMap).map((provider) => (
            <form
              action={async () => {
                'use server';
                try {
                  await signIn(provider.id);
                } catch (error) {
                  if (error instanceof AuthError) {
                    return redirect(`${lng}/login/error?type=${error.type}`);
                  }
                  throw error;
                }
              }}
            >
              <button type="submit">
                <span>Sign in with {provider.name}</span>
              </button>
            </form>
          ))}
        </DialogFooter>
      </Card>
    </div>
  );
}
