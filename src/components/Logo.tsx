import type { SVGProps } from 'react';
import { APP_NAME } from '@/lib/constants';
import { Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ iconOnly = false, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sidebar-foreground", className)}>
      <Bike className="h-7 w-7 text-primary" />
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight">
          {APP_NAME}
        </span>
      )}
    </div>
  );
}
