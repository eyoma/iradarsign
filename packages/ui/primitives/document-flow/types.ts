import { FieldType } from '@prisma/client';
import { z } from 'zod';

import { ZFieldMetaSchema } from '@documenso/lib/types/field-meta';

export const ZDocumentFlowFormSchema = z.object({
  title: z.string().min(1),

  signers: z.array(
    z.object({
      formId: z.string().min(1),
      nativeId: z.number().optional(),
      email: z.string().min(1).email(),
      name: z.string(),
    }),
  ),

  fields: z.array(
    z.object({
      formId: z.string().min(1),
      nativeId: z.number().optional(),
      type: z.nativeEnum(FieldType),
      signerEmail: z.string().min(1).optional(),
      recipientId: z.number().min(1),
      pageNumber: z.number().min(1),
      pageX: z.number().min(0),
      pageY: z.number().min(0),
      pageWidth: z.number().min(0),
      pageHeight: z.number().min(0),
      fieldMeta: ZFieldMetaSchema,
    }),
  ),

  email: z.object({
    subject: z.string(),
    message: z.string(),
  }),
});

export type TDocumentFlowFormSchema = z.infer<typeof ZDocumentFlowFormSchema>;

export const FRIENDLY_FIELD_TYPE: Record<FieldType, MessageDescriptor> = {
  [FieldType.SIGNATURE]: "Signature",
  [FieldType.FREE_SIGNATURE]: "Free Signature",
  [FieldType.INITIALS]: "Initials",
  [FieldType.TEXT]: "Tex",
  [FieldType.DATE]: msg"Date",
  [FieldType.EMAIL]: "Email",
  [FieldType.NAME]: "Name",
  [FieldType.NUMBER]: "Number",
  [FieldType.RADIO]: "Radio",
  [FieldType.CHECKBOX]: "Checkbox",
  [FieldType.DROPDOWN]: "Select",
};

export interface DocumentFlowStep {
  title: MessageDescriptor;
  description: MessageDescriptor;
  stepIndex?: number;
  onBackStep?: () => unknown;
  onNextStep?: () => unknown;
}
