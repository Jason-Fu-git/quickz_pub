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
import { useTranslation } from '@/i18n/client';
import { useState } from 'react';
import ProcessingDialog from '@/components/processingDialog';

// check if user exists
const userExists = async (username: string) => {
  const response = await fetch(
    `/api/user/exists?name=${encodeURIComponent(username)}`
  );
  const data = await response.json();
  return data.exists;
};

// check if the organization exists
const orgExists = async (organization: string) => {
  const response = await fetch(
    `/api/org/exists?name=${encodeURIComponent(organization)}`
  );
  const data = await response.json();
  return data.exists;
};

export default function RegisterAdminPage({
                                            params: { lng }
                                          }: {
  params: {
    lng: string;
  };
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
        })
        .refine(async (organization) => !(await orgExists(organization)), {
          message: t('Organization already exists')
        })
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: t('passwords do not match')
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
      organization: ''
    }
  });

  // form submission handler
  async function onSubmit(formData: z.infer<typeof formSchema>) {
    setAlertTitle(t('Registering...'));
    setAlertMessage(t('Please wait while we register your account'));
    setIsProcessing(true);
    setAlertVisible(true);
    try {
      // first create the organization
      const orgResponse = await fetch('/api/org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: formData.organization })
      });

      if (!orgResponse.ok) {
        throw new Error('Failed to create organization');
      }

      // then get the organization id
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
          privileges: 'admin'
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }

      // redirect to the login page
      setAlertTitle(t('Success'));
      setAlertMessage(t('Your account registered successfully. Please login.'));
      window.location.href = `/${lng}/login`;
    } catch (error) {
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
            <CardTitle>{t('Register as an admin')}</CardTitle>
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
                          type="organization"
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
