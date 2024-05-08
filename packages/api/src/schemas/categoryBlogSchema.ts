import z from "zod";

import { createSeoFormSchema } from "./seoSchema";

/** Create CategoryBlog */
export const createCategoryBlogFormSchema = z.object({
  name: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  description: z
    .string({ required_error: "No deje vacío este campo" })
    .max(500)
    .nullish(),
});

export type CreateCategoryBlogFormValues = z.infer<
  typeof createCategoryBlogFormSchema
>;

export const createCategoryBlogSchema = createCategoryBlogFormSchema.extend({
  parentValue: z.string().optional(),
  imageId: z.string().optional(),
});

/** Update CategoryBlog */
export const updateCategoryBlogFormSchema = createCategoryBlogFormSchema.extend(
  {
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    seo: createSeoFormSchema,
  },
);

export type UpdateCategoryBlogFormValues = z.infer<
  typeof updateCategoryBlogFormSchema
>;

export const updateCategoryBlogSchema = updateCategoryBlogFormSchema.extend({
  id: z.string().cuid(),
  imageId: z.string().optional(),
  parentId: z.string().nullish(),
  checked: z.boolean(),
});
