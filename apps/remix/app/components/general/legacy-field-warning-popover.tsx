import { AlertCircle } from 'lucide-react';
import { useRevalidator } from 'react-router';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import { PopoverHover } from '@documenso/ui/primitives/popover';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type LegacyFieldWarningPopoverProps = {
  type?: 'document' | 'template';
  documentId?: number;
  templateId?: number;
};

export const LegacyFieldWarningPopover = ({
  type = 'document',
  documentId,
  templateId,
}: LegacyFieldWarningPopoverProps) => {
  const { toast } = useToast();

  const revalidator = useRevalidator();

  const { mutateAsync: updateTemplate, isPending: isUpdatingTemplate } =
    trpc.template.updateTemplate.useMutation();
  const { mutateAsync: updateDocument, isPending: isUpdatingDocument } =
    trpc.document.update.useMutation();

  const onUpdateFieldsClick = async () => {
    if (type === 'document') {
      if (!documentId) {
        return;
      }

      await updateDocument({
        documentId,
        data: {
          useLegacyFieldInsertion: false,
        },
      });
    }

    if (type === 'template') {
      if (!templateId) {
        return;
      }

      await updateTemplate({
        templateId,
        data: {
          useLegacyFieldInsertion: false,
        },
      });
    }

    void revalidator.revalidate();

    toast({
      title: "Fields updated",
      description: 
        "The fields have been updated to the new field insertion method successfully",
      ,
    });
  };

  return (
    <PopoverHover
      side="bottom"
      trigger={
        <Button variant="outline" className="h-9 w-9 p-0">
          <span className="sr-only">
            {type === 'document' ? (
              Document is using legacy field insertion
            ) : (
              Template is using legacy field insertion
            )}
          </span>
          <AlertCircle className="h-5 w-5" />
        </Button>
      }
    >
      <p className="text-muted-foreground text-sm">
        {type === 'document' ? (
          
            This document is using legacy field insertion, we recommend using the new field
            insertion method for more accurate results.
          
        ) : (
          
            This template is using legacy field insertion, we recommend using the new field
            insertion method for more accurate results.
          
        )}
      </p>

      <div className="mt-2 flex w-full items-center justify-end">
        <Button
          type="button"
          size="sm"
          loading={isUpdatingDocument || isUpdatingTemplate}
          onClick={onUpdateFieldsClick}
        >
          Update Fields
        </Button>
      </div>
    </PopoverHover>
  );
};
