import z, { any } from "zod";
import { updateProductFormSchema } from "./productSchema";

/** Create Producer */
export const createProducerFormSchema = z.object({
  name: z.string().min(2).max(32),
  emails: z.array(z.string().min(6).max(34)),
  phones: z.array(z.string().min(5).max(15)),
  webSite: z.string().nullable(),
  location: z.string().min(2).max(32),
});

export type CreateProducerFormValues = z.infer<typeof createProducerFormSchema>;

export const createProducerSchema = createProducerFormSchema.extend({
  logoId: z.string().optional(),
  product: z.array(z.string().optional()).optional(),
  categories: z.array(z.string().optional()),
});

export const updateProducerFormSchema = createProducerFormSchema.extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  product: z.object({
    product: any().nullish(),
    price: z.number().nullish(),
    delivery: z.number().nullish(),
  }).array(),
});

export type UpdateProducerFormValues = z.infer<typeof updateProducerFormSchema>;

export const updateProducerSchema = updateProducerFormSchema.extend({
  id: z.string().cuid(),
  logoId: z.string().optional(),
  categories: z.string().array(),
});

export const ProducerSchema = updateProducerFormSchema.extend({
  id: z.string().cuid(),
  logoId: z.string().nullable(),
  categories: z.string().array(),
});
