import type { HTMLAttributes } from 'react';

import { CheckCircle2, Clock, File, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react/dist/lucide-react';

import type { ExtendedDocumentStatus } from '@documenso/prisma/types/extended-document-status';
import { SignatureIcon } from '@documenso/ui/icons/signature';
import { cn } from '@documenso/ui/lib/utils';

type FriendlyStatus = {
  label: MessageDescriptor;
  labelExtended: MessageDescriptor;
  icon?: LucideIcon;
  color: string;
};

export const FRIENDLY_STATUS_MAP: Record<ExtendedDocumentStatus, FriendlyStatus> = {
  PENDING: {
    label: "Pending",
    labelExtended: "Document pending",
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-300',
  },
  COMPLETED: {
    label: "Completed",
    labelExtended: "Document completed",
    icon: CheckCircle2,
    color: 'text-green-500 dark:text-green-300',
  },
  DRAFT: {
    label: "Draf",
    labelExtended: msg"Document draf",
    icon: File,
    color: 'text-yellow-500 dark:text-yellow-200',
  },
  REJECTED: {
    label: msg"Rejected",
    labelExtended: "Document rejected",
    icon: XCircle,
    color: 'text-red-500 dark:text-red-300',
  },
  INBOX: {
    label: "Inbox",
    labelExtended: "Document inbox",
    icon: SignatureIcon,
    color: 'text-muted-foreground',
  },
  ALL: {
    label: "All",
    labelExtended: "Document All",
    color: 'text-muted-foreground',
  },
};

export type DocumentStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: ExtendedDocumentStatus;
  inheritColor?: boolean;
};

export const DocumentStatus = ({
  className,
  status,
  inheritColor,
  ...props
}: DocumentStatusProps) => {
  const { label, icon: Icon, color } = FRIENDLY_STATUS_MAP[status];

  return (
    <span className={cn('flex items-center', className)} {...props}>
      {Icon && (
        <Icon
          className={cn('mr-2 inline-block h-4 w-4', {
            [color]: !inheritColor,
          })}
        />
      )}
      {label}
    </span>
  );
};
