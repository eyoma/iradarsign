import type * as DialogPrimitive from '@radix-ui/react-dialog';

import { CopyTextButton } from '@documenso/ui/components/common/copy-text-button';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { Label } from '@documenso/ui/primitives/label';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type OrganisationEmailDomainRecordsDialogProps = {
  trigger: React.ReactNode;
  records: DomainRecord[];
} & Omit<DialogPrimitive.DialogProps, 'children'>;

type DomainRecord = {
  name: string;
  value: string;
  type: string;
};

export const OrganisationEmailDomainRecordsDialog = ({
  trigger,
  records,
  ...props
}: OrganisationEmailDomainRecordsDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild={true}>
        {trigger}
      </DialogTrigger>

      <OrganisationEmailDomainRecordContent records={records} />
    </Dialog>
  );
};

export const OrganisationEmailDomainRecordContent = ({ records }: { records: DomainRecord[] }) => {
  const { toast } = useToast();

  return (
    <DialogContent position="center" className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>
          Verify Domain
        </DialogTitle>
        <DialogDescription>
          Add these DNS records to verify your domain ownership
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-4">
          {records.map((record) => (
            <div className="space-y-4 rounded-md border p-4" key={record.name}>
              <div className="space-y-2">
                <Label>
                  Record Type
                </Label>

                <div className="relative">
                  <Input className="pr-12" disabled value={record.type} />
                  <div className="absolute bottom-0 right-2 top-0 flex items-center justify-center">
                    <CopyTextButton
                      value={record.type}
                      onCopySuccess={() => toast({ title: "Copied to clipboard" })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Record Name
                </Label>

                <div className="relative">
                  <Input className="pr-12" disabled value={record.name} />
                  <div className="absolute bottom-0 right-2 top-0 flex items-center justify-center">
                    <CopyTextButton
                      value={record.name}
                      onCopySuccess={() => toast({ title: "Copied to clipboard" })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Record Value
                </Label>

                <div className="relative">
                  <Input className="pr-12" disabled value={record.value} />
                  <div className="absolute bottom-0 right-2 top-0 flex items-center justify-center">
                    <CopyTextButton
                      value={record.value}
                      onCopySuccess={() => toast({ title: "Copied to clipboard" })}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Alert variant="neutral">
          <AlertDescription>
            
              Once you update your DNS records, it may take up to 48 hours for it to be propogated.
              Once the DNS propagation is complete you will need to come back and press the "Sync"
              domains button
            
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};
