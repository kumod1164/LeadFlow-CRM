import { z } from 'zod';

/**
 * Pipeline stage enum for validation
 */
export const PipelineStageEnum = z.enum([
  'New',
  'Contacted',
  'Qualified',
  'Won',
  'Lost',
]);

/**
 * Schema for creating a new lead
 * All required fields must be provided
 */
export const CreateLeadSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .trim(),
  
  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  
  phone: z
    .string()
    .trim()
    .optional(),
  
  company: z
    .string()
    .trim()
    .optional(),
  
  stage: PipelineStageEnum.default('New'),
  
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional(),
  
  followUpDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema for updating an existing lead
 * All fields are optional (partial update)
 */
export const UpdateLeadSchema = CreateLeadSchema.partial();

/**
 * Schema for updating lead stage (Kanban drag-and-drop)
 */
export const UpdateStageSchema = z.object({
  leadId: z
    .string()
    .min(1, 'Lead ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID format'),
  
  stage: PipelineStageEnum,
});

/**
 * Type exports for TypeScript
 */
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;
export type PipelineStage = z.infer<typeof PipelineStageEnum>;
