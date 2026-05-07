import { z } from 'zod';

/**
 * Schema for adding a note to a lead
 * Content must not be empty
 */
export const AddNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty')
    .trim(),
});

/**
 * Type export for TypeScript
 */
export type AddNoteInput = z.infer<typeof AddNoteSchema>;
