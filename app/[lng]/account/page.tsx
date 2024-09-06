'use client';

import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ProcessingDialog from '@/components/processingDialog';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/client';

export default function AccountPage({
  params: { lng }
}: {
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);

  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userName, setUserName] = useState('');
  const [privilege, setPrivilege] = useState('');

  // alert dialog
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const fetchInfo = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.push(`/${lng}/login`);
        return;
      }
      const user = session.user;
      if (!user || !user.id || !user.image || !user.name) {
        router.push(`/${lng}/login`);
        return;
      }

      // fetch user information
      const uResponse = await fetch(`/api/user?name=${user.name}`);
      if (!uResponse.ok) {
        throw new Error('An error occurred while fetching user information.');
      }
      const userData = await uResponse.json();
      // extract user privilege
      const priv = userData.privileges;

      setUserId(user.id);
      setUserImage(user.image);
      setUserName(user.name);
      setPrivilege(priv);
      setIsLoading(false);
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('An error occurred while fetching user information.'));
      setAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // schema
  const resetSchema = z
    .object({
      originalPassword: z
        .string()
        .min(6, t('password should be at least 6 chars'))
        .max(50, t('password should be at most 50 chars'))
        .refine(
          async (data) => {
            const response = await fetch(
              '/api/user/exists?name=' + userName + '&password=' + data
            );
            const json = await response.json();
            return json.exists;
          },
          {
            message: t('incorrect password')
          }
        ),
      newPassword: z
        .string()
        .min(6, t('password should be at least 6 chars'))
        .max(50, t('password should be at most 50 chars')),
      confirmPassword: z
        .string()
        .min(6, t('password should be at least 6 chars'))
        .max(50, t('password should be at most 50 chars'))
    })
    .superRefine((data, ctx) => {
      // check if new password and confirm password are the same
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t('passwords do not match')
        });
      }
    });

  const deleteSchema = z.object({
    confirm: z
      .string()
      .refine((data) => data === userName && data && data !== '')
  });

  // form data
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      originalPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirm: ''
    }
  });

  // submit handler
  const onResetSubmit = async (data: z.infer<typeof resetSchema>) => {
    setIsProcessing(true);
    setAlertTitle(t('Processing...'));
    setAlertMessage(t('Pleas wait while we update your password.'));
    setAlertOpen(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: userId,
          password: data.newPassword
        })
      });
      if (!response.ok) {
        throw new Error('An error occurred while updating password.');
      }
      setAlertTitle(t('Success'));
      setAlertMessage(t('Password updated successfully.'));
      setAlertOpen(true);
      window.location.reload();
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('An error occurred while updating password.'));
      setAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeleteSubmit = async (data: z.infer<typeof deleteSchema>) => {
    setIsProcessing(true);
    setAlertTitle(t('Processing...'));
    setAlertMessage(t('Pleas wait while we delete your account.'));
    setAlertOpen(true);
    try {
      const response = await fetch(`/api/user?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('An error occurred while deleting account.');
      }
      setAlertTitle(t('Success'));
      setAlertMessage(t('Account deleted successfully.'));
      setAlertOpen(true);
      router.push(`/${lng}/login`);
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('An error occurred while deleting account.'));
      setAlertOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-start md:items-center p-8">
        <Card className="w-full max-w-sm">
          {isLoading ? (
            <div className="flex-col items-center space-y-5">
              <div className="flex items-center space-x-4 p-5">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-5">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[100px]" />
                </div>
              </div>
              <div className="space-y-5 p-5">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[250px]" />
              </div>
            </div>
          ) : (
            <div className="flex-col items-center space-y-5">
              <div className="flex items-center space-x-6 p-5">
                <Image
                  src={userImage + '&size=128'}
                  alt={userImage + '&size=128'}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
                <div className="flex flex-col items-start space-y-5">
                  <Label className="text-2xl">{userName}</Label>
                  <Badge variant="outline" className="capitalize">
                    {privilege}
                  </Badge>
                </div>
              </div>
              <div className="px-4 pb-5">
                <Separator />
                <Accordion type="single" collapsible>
                  <AccordionItem value="reset password">
                    <AccordionTrigger>{t('Reset password')}</AccordionTrigger>
                    <AccordionContent>
                      <Form {...resetForm}>
                        <form
                          className="space-y-4 px-2"
                          onSubmit={resetForm.handleSubmit(onResetSubmit)}
                        >
                          <FormField
                            control={resetForm.control}
                            name="originalPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('Original password')}</FormLabel>
                                <FormDescription>
                                  {t(
                                    'Default password is 88880000. If you have forgotten your password, please contact the administrator.'
                                  )}
                                </FormDescription>
                                <FormControl>
                                  <Input
                                    placeholder="Original Password"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={resetForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('New Password')}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="New Password"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={resetForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('Confirm Password')}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Confirm Password"
                                    type="password"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            {t('Submit')}
                          </Button>
                        </form>
                      </Form>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {privilege === 'admin' && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="delete account">
                      <AccordionTrigger className="text-red-700">
                        {t('Delete account')}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Form {...deleteForm}>
                          <form
                            className="space-y-4 px-2"
                            onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}
                          >
                            <FormField
                              control={deleteForm.control}
                              name="confirm"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('Confirm')}</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder={t('Type your username')}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              variant="outline"
                              className="w-full bg-red-700 text-white"
                              type="submit"
                            >
                              {t('Confirm deletion')}
                            </Button>
                          </form>
                        </Form>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      <ProcessingDialog
        title={alertTitle}
        message={alertMessage}
        isOpen={alertOpen}
        setIsOpen={setAlertOpen}
        isProcessing={isProcessing}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
