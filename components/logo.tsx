import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('font-semibold text-xl text-rose-600', className)}>
      TC Bot
    </div>
  );
}
