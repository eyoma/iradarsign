import { Button, Heading, Text } from '../components';

export interface TemplateDocumentRejectedProps {
  documentName: string;
  recipientName: string;
  rejectionReason?: string;
  documentUrl: string;
}

export function TemplateDocumentRejected({
  documentName,
  recipientName: signerName,
  rejectionReason,
  documentUrl,
}: TemplateDocumentRejectedProps) {
  return (
    <div className="mt-4">
      <Heading className="mb-4 text-center text-2xl font-semibold text-slate-800">
        Document Rejected
      </Heading>

      <Text className="mb-4 text-base">
        {signerName} has rejected the document "{documentName}".
      </Text>

      {rejectionReason && (
        <Text className="mb-4 text-base text-slate-400">
          Reason for rejection: {rejectionReason}
        </Text>
      )}

      <Text className="mb-6 text-base">
        You can view the document and its status by clicking the button below.
      </Text>

      <Button
        href={documentUrl}
        className="bg-documenso-500 inline-flex items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-medium text-black no-underline"
      >
        View Document
      </Button>
    </div>
  );
}
