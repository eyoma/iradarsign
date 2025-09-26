import React, { forwardRef } from 'react';

import { RecipientRole } from '@prisma/client';
import type { SelectProps } from '@radix-ui/react-select';
import { InfoIcon } from 'lucide-react';

import { ROLE_ICONS } from '@documenso/ui/primitives/recipient-role-icons';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@documenso/ui/primitives/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@documenso/ui/primitives/tooltip';

import { cn } from '../../lib/utils';

export type RecipientRoleSelectProps = SelectProps & {
  hideCCRecipients?: boolean;
  isAssistantEnabled?: boolean;
};

export const RecipientRoleSelect = forwardRef<HTMLButtonElement, RecipientRoleSelectProps>(
  ({ hideCCRecipients, isAssistantEnabled = true, ...props }, ref) => (
    <Select {...props}>
      <SelectTrigger ref={ref} className="bg-background w-[50px] p-2">
        {/* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */}
        {ROLE_ICONS[props.value as RecipientRole]}
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value={RecipientRole.SIGNER}>
          <div className="flex items-center">
            <div className="flex w-[150px] items-center">
              <span className="mr-2">{ROLE_ICONS[RecipientRole.SIGNER]}</span>
              Needs to sign
            </div>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="text-foreground z-9999 max-w-md p-4">
                <p>
                  
                    The recipient is required to sign the document for it to be completed.
                  
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SelectItem>

        <SelectItem value={RecipientRole.APPROVER}>
          <div className="flex items-center">
            <div className="flex w-[150px] items-center">
              <span className="mr-2">{ROLE_ICONS[RecipientRole.APPROVER]}</span>
              Needs to approve
            </div>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="text-foreground z-9999 max-w-md p-4">
                <p>
                  
                    The recipient is required to approve the document for it to be completed.
                  
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SelectItem>

        <SelectItem value={RecipientRole.VIEWER}>
          <div className="flex items-center">
            <div className="flex w-[150px] items-center">
              <span className="mr-2">{ROLE_ICONS[RecipientRole.VIEWER]}</span>
              Needs to view
            </div>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="text-foreground z-9999 max-w-md p-4">
                <p>
                  
                    The recipient is required to view the document for it to be completed.
                  
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SelectItem>

        {!hideCCRecipients && (
          <SelectItem value={RecipientRole.CC}>
            <div className="flex items-center">
              <div className="flex w-[150px] items-center">
                <span className="mr-2">{ROLE_ICONS[RecipientRole.CC]}</span>
                Receives copy
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="text-foreground z-9999 max-w-md p-4">
                  <p>
                    
                      The recipient is not required to take any action and receives a copy of the
                      document after it is completed.
                    
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </SelectItem>
        )}

        <SelectItem
          value={RecipientRole.ASSISTANT}
          disabled={!isAssistantEnabled}
          className={cn(
            !isAssistantEnabled &&
              'cursor-not-allowed opacity-50 data-[disabled]:pointer-events-auto',
          )}
        >
          <div className="flex items-center">
            <div className="flex w-[150px] items-center">
              <span className="mr-2">{ROLE_ICONS[RecipientRole.ASSISTANT]}</span>
              Can prepare
            </div>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="text-foreground z-9999 max-w-md p-4">
                <p>
                  {isAssistantEnabled ? (
                    
                      The recipient can prepare the document for later signers by pre-filling
                      suggest values.
                    
                  ) : (
                    
                      Assistant role is only available when the document is in sequential signing
                      mode.
                    
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
);

RecipientRoleSelect.displayName = 'RecipientRoleSelect';
