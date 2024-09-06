'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';

import { languages, fallbackLng } from '@/i18n/settings';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Check, Languages } from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import i18next from 'i18next';
import * as url from 'node:url';
import { usePathname, useRouter } from 'next/navigation';

type Option = {
  label: string;
  value: string;
};

const labels = {
  cn: '简体中文',
  en: 'English'
};

export default function Language({
  lng,
  labelVisible
}: {
  lng: string;
  labelVisible: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(lng);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // change pathname
    const paths = pathname.split('/');
    paths[1] = selectedLanguage;
    const newPath = paths.join('/');
    router.push(newPath);
  }, [selectedLanguage]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
          <Languages className={'h-5 w-5'} />
          {
            labelVisible && (
              <span>{labels[selectedLanguage]}</span>
            )
          }
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Change language..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {languages.map((lng) => (
                <CommandItem
                  key={lng}
                  value={lng}
                  onSelect={(value) => {
                    setSelectedLanguage(
                      languages.find((priority) => priority === value) ||
                        fallbackLng
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedLanguage === lng ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {labels[lng]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
