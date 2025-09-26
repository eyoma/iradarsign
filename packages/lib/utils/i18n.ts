/**
 * Minimal i18n utilities for non-internationalized setup
 * Provides basic message parsing without actual translation
 */

export type MessageDescriptor = string;

/**
 * Parse a message descriptor (in this case, just return the string as-is)
 * This is a no-op function for non-internationalized setup
 */
export const parseMessageDescriptor = (
  _: any,
  message: MessageDescriptor | string
): string => {
  return typeof message === 'string' ? message : String(message);
};

/**
 * Simple message function that returns the string as-is
 * This replaces the msg"string" macro functionality
 */
export const msg = (template: TemplateStringsArray, ...values: any[]): string => {
  return template.reduce((result, string, i) => {
    return result + string + (values[i] || '');
  }, '');
};

/**
 * Simple i18n function that returns the string as-is
 * This replaces the i18n."string" macro functionality
 */
export const i18n = {
  get: (key: string): string => key,
  t: (key: string): string => key,
};
