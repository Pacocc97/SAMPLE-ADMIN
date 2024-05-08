import z from "zod";

import { createSeoFormSchema } from "./seoSchema";

/** Create Category */
export const createCategoryFormSchema = z.object({
  name: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  description: z
    .string({ required_error: "No deje vacío este campo" })
    .max(100)
    .nullish(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>;

export const createCategorySchema = createCategoryFormSchema.extend({
  parentValue: z.string().optional(),
  imageId: z.string().optional(),
});

/** Update Category */
export const updateCategoryFormSchema = createCategoryFormSchema.extend({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  characteristics: z.array(
    z
      .object({
        id: z.string().optional(),
        name: z.string(),
        type: z.string(),
        unit: z.string().nullish(),
      })
      .optional(),
  ),
  seo: createSeoFormSchema,
});

export type UpdateCategoryFormValues = z.infer<typeof updateCategoryFormSchema>;

export const updateCategorySchema = updateCategoryFormSchema.extend({
  id: z.string().cuid(),
  imageId: z.string().optional(),
  parentId: z.string().nullish(),
  checked: z.boolean(),
});
