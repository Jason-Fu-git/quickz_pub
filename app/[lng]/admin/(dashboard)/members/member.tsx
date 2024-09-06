'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectUser } from '@/lib/db';
import ProcessingDialog from '@/components/processingDialog';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/i18n/client';

export function Member({ member, lng }: { member: SelectUser; lng: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const { t } = useTranslation(lng);

  // delete member by its id
  async function deleteUser() {
    setDialogTitle(t('Deleting...'));
    setDialogMessage(t('Please wait while we delete the user.'));
    setIsProcessing(true); // set processing to true
    setIsDialogOpen(true); // open the dialog

    try {
      const response = await fetch(`/api/user?id=${member.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setDialogTitle(t('Success'));
      setDialogMessage(t('User deleted successfully.'));
      setIsProcessing(false); // set processing to false
      window.location.reload(); // reload the page
    } catch (e) {
      setDialogTitle(t('Error'));
      setDialogMessage(t('Failed to delete user.'));
      setIsProcessing(false); // set processing to false
    }
  }

  // reset password of the member
  async function resetPassword() {
    setDialogTitle(t('Resetting password...'));
    setDialogMessage(t('Please wait while we reset the password'));
    setIsProcessing(true); // set processing to true
    setIsDialogOpen(true); // open the dialog
    try {
      const response = await fetch(`/api/user/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: member.id })
      });
      if (!response.ok) {
        throw new Error('Failed to reset password');
      }
      setDialogTitle(t('Success'));
      setDialogMessage(t('Password reset successfully'));
      setIsProcessing(false); // set processing to false
    } catch (e) {
      setDialogTitle(t('Error'));
      setDialogMessage(t('Failed to reset password'));
      setIsProcessing(false); // set processing to false
      console.error(e);
    }
  }

  return (
    <>
      <TableRow>
        <TableCell className="hidden sm:table-cell">
          <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="32"
            src={
              'https://ui-avatars.com/api/?name=' + member.name + '&format=png'
            }
            width="32"
          />
        </TableCell>
        <TableCell className="font-medium">{member.name}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant="outline" className="capitalize">
            {member.source}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            {member.privileges !== 'admin' && (
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('Actions')}</DropdownMenuLabel>
                <Separator></Separator>
                <DropdownMenuItem>
                  <button onClick={resetPassword}>{t('Reset password')}</button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button onClick={deleteUser} className="text-red-700">
                    {t('Delete')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Waiting... */}
      <ProcessingDialog
        title={dialogTitle}
        message={dialogMessage}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        isProcessing={isProcessing}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
