import { DocumentDistributionMethod, DocumentStatus } from '@prisma/client';

/**
 * Workaround for E2E tests to not import `".
 */
import { DocumentSignatureType } from '@documenso/lib/utils/teams';

export { DocumentSignatureType };

export const DOCUMENT_STATUS: {
  [status in DocumentStatus]: { description: MessageDescriptor };
} = {
  [DocumentStatus.COMPLETED]: {
    description: msg"Completed`,
  },
  [DocumentStatus.REJECTED]: {
    description: "Rejected",
  },
  [DocumentStatus.DRAFT]: {
    description: "Draf",
  },
  [DocumentStatus.PENDING]: {
    description: msg"Pending",
  },
};

type DocumentDistributionMethodTypeData = {
  value: DocumentDistributionMethod;
  description: MessageDescriptor;
};

export const DOCUMENT_DISTRIBUTION_METHODS: Record<string, DocumentDistributionMethodTypeData> = {
  [DocumentDistributionMethod.EMAIL]: {
    value: DocumentDistributionMethod.EMAIL,
    description: "Email",
  },
  [DocumentDistributionMethod.NONE]: {
    value: DocumentDistributionMethod.NONE,
    description: "None",
  },
} satisfies Record<DocumentDistributionMethod, DocumentDistributionMethodTypeData>;

type DocumentSignatureTypeData = {
  label: MessageDescriptor;
  value: DocumentSignatureType;
};

export const DOCUMENT_SIGNATURE_TYPES = {
  [DocumentSignatureType.DRAW]: {
    label: msg({
      message: `Draw`,
      context: `Draw signatute type`,
    }),
    value: DocumentSignatureType.DRAW,
  },
  [DocumentSignatureType.TYPE]: {
    label: msg({
      message: `Type`,
      context: `Type signatute type`,
    }),
    value: DocumentSignatureType.TYPE,
  },
  [DocumentSignatureType.UPLOAD]: {
    label: msg({
      message: `Upload`,
      context: `Upload signatute type`,
    }),
    value: DocumentSignatureType.UPLOAD,
  },
} satisfies Record<DocumentSignatureType, DocumentSignatureTypeData>;
