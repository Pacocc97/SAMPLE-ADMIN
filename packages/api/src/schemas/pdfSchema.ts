import z from "zod";

export const createPdfSchema = z.object({
  path: z.string().min(1),
  original: z.string().min(1),
});

export const createPdfFromSchema = z.object({
  pdf: z.string().regex(/data:application\/pdf;base64,/),
  name: z.string().optional(),
  path: z.string().min(1),
});

export type CreatePdfInput = z.TypeOf<typeof createPdfSchema>;
