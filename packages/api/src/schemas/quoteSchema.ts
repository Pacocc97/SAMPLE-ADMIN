import z from "zod";

/** Create Quote */
export const createQuoteFormSchema = z.object({
  products: z.string().array().optional(),
  user: z.string().optional(),
  name: z.string().optional(),
  discount: z.number().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateQuoteFormValues = z.infer<typeof createQuoteFormSchema>;

/** Save Quote */
export const saveQuoteFormSchema = z.object({
  products: z.any().array(),
  user: z.string(),
  pdfId: z.string().optional(),
  id: z.string().optional(),
});

export type SaveQuoteFormValues = z.infer<typeof saveQuoteFormSchema>;
