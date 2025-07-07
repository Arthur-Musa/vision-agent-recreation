import { z } from 'zod';

// Common validation schemas
export const ClaimDataSchema = z.object({
  tipo_sinistro: z.string().min(1, 'Tipo de sinistro é obrigatório').max(100),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000),
  valor_estimado: z.number().positive('Valor deve ser positivo').optional(),
  documentos: z.array(z.string()).optional()
});

export const FileUploadSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo é obrigatório'),
  type: z.string().min(1, 'Tipo do arquivo é obrigatório'),
  size: z.number().positive('Tamanho do arquivo deve ser positivo')
});

export const ChatInputSchema = z.object({
  message: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(500, 'Mensagem muito longa')
    .regex(/^[^<>{}]*$/, 'Caracteres especiais não permitidos')
});

export const AgentSelectionSchema = z.object({
  agentId: z.string().min(1, 'Agent ID é obrigatório'),
  files: z.array(FileUploadSchema).min(1, 'Pelo menos um arquivo é necessário')
});

// Validation helper functions
export const validateClaimData = (data: unknown) => {
  return ClaimDataSchema.safeParse(data);
};

export const validateFileUpload = (file: unknown) => {
  return FileUploadSchema.safeParse(file);
};

export const validateChatInput = (input: unknown) => {
  return ChatInputSchema.safeParse(input);
};

export const validateAgentSelection = (data: unknown) => {
  return AgentSelectionSchema.safeParse(data);
};

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    // Remove sensitive information from error messages
    return error.message
      .replace(/https?:\/\/[^\s]+/g, '[URL]') // Remove URLs
      .replace(/\b\d{4,}\b/g, '[NUMBER]') // Remove long numbers
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]'); // Remove emails
  }
  return 'Um erro inesperado ocorreu';
};