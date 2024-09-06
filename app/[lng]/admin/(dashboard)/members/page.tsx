'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { SelectUser } from '@/lib/db';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MembersTable } from './members-table';
import processingDialog from '@/components/processingDialog';
import ProcessingDialog from '@/components/processingDialog';
import { useTranslation } from '@/i18n/client';

export default function ProductsPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { q: string; offset: string };
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);

  const [members, setMembers] = useState<SelectUser[]>([]);
  const [newOffset, setNewOffset] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // org info
  const [orgName, setOrgName] = useState('');
  const [secret, setSecret] = useState('');
  const router = useRouter();
  let offset = parseInt(searchParams.offset ?? 0, 10);

  const fetchInfo = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.push(`/${lng}/login`);
        return;
      } else {
        // fetch org info
        offset = parseInt(searchParams.offset ?? 0, 10);
        const response = await fetch(`/api/org?userid=${session.user?.id}`);
        const data = await response.json();
        setOrgName(data.name);
        setSecret(data.secret);
        // fetch members
        const mResponse = await fetch(
          `/api/members?orgid=${data.id}&offset=${offset}`
        );
        if (!mResponse.ok) {
          throw new Error('Failed to fetch members');
        }
        const mData = await mResponse.json();
        if (mData) {
          setMembers(mData.members);
          setNewOffset(mData.newOffset);
          setTotalMembers(mData.totalMembers);
          setIsLoading(false);
        }
      }
    } catch (e) {
      setIsDialogOpen(true);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [offset]);

  return (
    <>
      <div className="space-y-8">
        <Card>
          {isLoading ? (
            <div className="flex items-center space-x-4 p-5">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 p-5">
              <Building2 className="h-10 w-10"></Building2>
              <div>
                <h1 className="text-xl font-semibold">{orgName}</h1>
                <Separator className="my-1"></Separator>
                <Label className="whitespace-normal w-full break-all">
                  {t('Secret')} : {secret}
                </Label>
              </div>
            </div>
          )}
        </Card>
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">{t('All')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <MembersTable
                members={members}
                offset={offset ?? 0}
                newOffset={newOffset}
                totalMembers={totalMembers}
                lng={lng}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <ProcessingDialog
        title={t('Error')}
        message={t('Error occurred while fetching data. Please refresh.')}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        isProcessing={false}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
