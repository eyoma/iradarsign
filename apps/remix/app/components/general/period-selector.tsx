import { useMemo } from 'react';

import { useLocation, useNavigate, useSearchParams } from 'react-router';

import type { PeriodSelectorValue } from '@documenso/lib/server-only/document/find-documents';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';

const isPeriodSelectorValue = (value: unknown): value is PeriodSelectorValue => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return ['', '7d', '14d', '30d'].includes(value as string);
};

export const PeriodSelector = () => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const period = useMemo(() => {
    const p = searchParams?.get('period') ?? 'all';

    return isPeriodSelectorValue(p) ? p : 'all';
  }, [searchParams]);

  const onPeriodChange = (newPeriod: string) => {
    if (!pathname) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString());

    params.set('period', newPeriod);

    if (newPeriod === '' || newPeriod === 'all') {
      params.delete('period');
    }

    void navigate(`${pathname}?${params.toString()}`, { preventScrollReset: true });
  };

  return (
    <Select defaultValue={period} onValueChange={onPeriodChange}>
      <SelectTrigger className="text-muted-foreground max-w-[200px]">
        <SelectValue />
      </SelectTrigger>

      <SelectContent position="popper">
        <SelectItem value="all">
          All Time
        </SelectItem>
        <SelectItem value="7d">
          Last 7 days
        </SelectItem>
        <SelectItem value="14d">
          Last 14 days
        </SelectItem>
        <SelectItem value="30d">
          Last 30 days
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
