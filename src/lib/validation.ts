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
    .max(2000, 'Mensagem muito longa (máximo 2000 caracteres)')
    .regex(/^[^<>{}]*$/, 'Caracteres especiais não permitidos')
    .refine(val => !val.toLowerCase().includes('script'), 'Conteúdo não permitido')
    .refine(val => !val.includes('javascript:'), 'Protocolo javascript não permitido')
    .refine(val => !val.includes('data:'), 'Protocolo data não permitido')
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

// Enhanced sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove style attributes
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove URL references
    .replace(/&#/g, '') // Remove HTML entities
    .replace(/&[a-zA-Z]+;/g, '') // Remove named HTML entities
    .trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow safe characters
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .replace(/^\./, '') // Remove leading dots
    .slice(0, 255); // Limit length
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
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