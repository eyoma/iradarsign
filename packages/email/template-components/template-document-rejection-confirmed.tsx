import { Container, Heading, Section, Text } from '../components';

interface TemplateDocumentRejectionConfirmedProps {
  recipientName: string;
  documentName: string;
  documentOwnerName: string;
  reason?: string;
}

export function TemplateDocumentRejectionConfirmed({
  recipientName,
  documentName,
  documentOwnerName,
  reason,
}: TemplateDocumentRejectionConfirmedProps) {
  return (
    <Container>
      <Section>
        <Heading className="text-2xl font-semibold">
          Rejection Confirmed
        </Heading>

        <Text className="text-primary text-base">
          
            This email confirms that you have rejected the document{' '}
            <strong className="font-bold">"{documentName}"</strong> sent by {documentOwnerName}.
          
        </Text>

        {reason && (
          <Text className="text-base font-medium text-slate-400">
            Rejection reason: {reason}
          </Text>
        )}

        <Text className="text-base">
          
            The document owner has been notified of this rejection. No further action is required
            from you at this time. The document owner may contact you with any questions regarding
            this rejection.
          
        </Text>
      </Section>
    </Container>
  );
}
