'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import * as assert from 'node:assert';
import { useState, useTransition } from 'react';
import { useTranslation } from '@/i18n/client';
import ProcessingDialog from '@/components/processingDialog';

// check if user exists
const userExists = async (username: string) => {
  const response = await fetch(
    `/api/user/exists?name=${encodeURIComponent(username)}`
  );
  const data = await response.json();
  return data.exists;
};

export default function RegisterUserPage({
                                           params: { lng }
                                         }: {
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);

  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // form schema
  const formSchema = z
    .object({
      username: z
        .string()
        .min(3, {
          message: t('Username must be at least 3 characters long')
        })
        .max(50, {
          message: t('Username must be at most 50 characters long')
        })
        .refine(async (username) => !(await userExists(username)), {
          message: t('User already exists')
        }),
      password: z
        .string()
        .min(6, {
          message: t('password should be at least 6 chars')
        })
        .max(50, {
          message: t('password should be at most 50 chars')
        }),
      confirmPassword: z
        .string()
        .min(6, {
          message: t('password should be at least 6 chars')
        })
        .max(50, {
          message: t('password should be at most 50 chars')
        }),
      organization: z
        .string()
        .min(1, {
          message: t('Organization must be at least 3 characters long')
        })
        .max(50, {
          message: t('Organization must be at most 50 characters long')
        }),
      secret: z.string()
    })
    .superRefine(async (data, ctx) => {
      // check if passwords match
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t('passwords do not match')
        });
      }
      // check if organization secret is correct
      const response = await fetch(
        `/api/org/right?name=${encodeURIComponent(data.organization)}&secret=${encodeURIComponent(data.secret)}`
      );
      const org = await response.json();
      if (!org.right) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secret'],
          message: t('Invalid secret')
        });
      }
    });
  // form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      organization: '',
      secret: ''
    }
  });

  // form submission handler
  async function onSubmit(formData: z.infer<typeof formSchema>) {
    setAlertTitle(t('Registering...'));
    setAlertMessage(t("Please wait while we register your account"));
    setAlertVisible(true);
    setIsProcessing(true);
    try {
      // get the organization id
      const orgData = await fetch(
        `/api/org?name=${encodeURIComponent(formData.organization)}`
      );

      if (!orgData.ok) {
        throw new Error('Failed to fetch organization');
      }

      const org = await orgData.json();
      const orgId = org.id;

      // then create the user
      const userResponse = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.username,
          password: formData.password,
          orgId,
          privileges: 'user'
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }

      // redirect to the login page
      setAlertTitle(t('Success'));
      setAlertMessage(t('Your account registered successfully. Please login.'));
      window.location.href = `/${lng}/login`;
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to register your account. Please try again later.'));
    } finally {
      setIsProcessing(false);
    }

  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-start md:items-center p-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-8">
            <CardTitle>{t('Register as a user')}</CardTitle>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Username')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Password')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Confirm Password')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Organization')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Organization"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Secret')}</FormLabel>
                      <FormDescription>
                        {t(
                          'Please contact your admin to obtain your organization\'s secret'
                        )}
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Secret" type="text" {...field} />
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
          </CardHeader>
        </Card>
      </div>
      <ProcessingDialog
        title={alertTitle}
        message={alertMessage}
        isOpen={alertVisible}
        setIsOpen={setAlertVisible}
        isProcessing={isProcessing}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
