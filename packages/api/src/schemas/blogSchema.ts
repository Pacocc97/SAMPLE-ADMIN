import z from "zod";

import { createCategoryBlogFormSchema } from "./categoryBlogSchema";
import { createSeoFormSchema } from "./seoSchema";

/** Create Blog */
export const createBlogFormSchema = z.object({
  title: z.string().min(2).max(32),
  shortDescription: z
    .string({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres")
    .max(400, "Este campo tiene que tener menos de 200 caracteres"),
  description: z
    .string({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres"),
  tags: z
    .string({
      required_error: "Ingrese por lo menos una etiqueta",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .array(),
});

export type CreateBlogFormValues = z.infer<typeof createBlogFormSchema>;

export const createBlogSchema = createBlogFormSchema.extend({
  imageId: z.string().optional(),
  BlogCategory: z.array(z.string()).optional(),
  draft: z.boolean(),
});

export const updateBlogFormSchema = createBlogFormSchema.extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  seo: createSeoFormSchema,
  publish: z.boolean().optional(),
});

export type UpdateBlogFormValues = z.infer<typeof updateBlogFormSchema>;

export const updateBlogSchema = updateBlogFormSchema.extend({
  id: z.string().cuid(),
  draft: z.boolean().optional(),
  imageId: z.string().nullish(),
  BlogCategory: z.array(z.string()).optional(),
  deletedAt: z
    .date({
      required_error: "Please select a date and time",
      invalid_type_error: "That's not a date!",
    })
    .nullish(),
  publishedAt: z
    .date({
      required_error: "Please select a date and time",
      invalid_type_error: "That's not a date!",
    })
    .nullish(),
  published: z.boolean().nullish(),
});
