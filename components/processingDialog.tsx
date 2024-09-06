import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../app/i18n/client';

interface ProcessingDialogProps {
  title: string;
  message: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isProcessing: boolean;
  confirmTXT?: string;
}

export default function ProcessingDialog({
  title,
  message,
  isOpen,
  setIsOpen,
  isProcessing,
  confirmTXT
}: ProcessingDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{message}</p>
        {!isProcessing && (
          <Button
            type="submit"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            {confirmTXT ? confirmTXT : 'Confirm'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
