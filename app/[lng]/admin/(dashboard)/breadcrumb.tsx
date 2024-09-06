'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Route } from 'lucide-react';

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;

    return (
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{segment}</BreadcrumbPage>
        ) : (
          <>
            <BreadcrumbLink asChild>
              <Link href={href}>{segment}</Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <div className="flex gap-5">
      <Route className="h-5 w-5 hidden md:flex"></Route>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>{breadcrumbs}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default DashboardBreadcrumb;
