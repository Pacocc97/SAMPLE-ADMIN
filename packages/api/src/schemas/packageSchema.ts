import z from "zod";

import { createSeoFormSchema } from "./seoSchema";

/** Create Package */
export const createPackageFormSchema = z.object({
  name: z.string().min(2).max(32),
  shortDescription: z
    .string({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres")
    .max(200, "Este campo tiene que tener menos de 200 caracteres"),
  description: z
    .string({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres"),
  price: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" })
    .gte(100)
    .lte(99999999999),
});

export type CreatePackageFormValues = z.infer<typeof createPackageFormSchema>;

export const createPackageSchema = createPackageFormSchema.extend({
  imageId: z.string().optional(),
  // seoId: z.string(),
  products: z.array(z.string()).optional(),
});

export const updatePackageFormSchema = createPackageFormSchema.extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  seo: createSeoFormSchema,
});

export type UpdatePackageFormValues = z.infer<typeof updatePackageFormSchema>;

export const updatePackageSchema = updatePackageFormSchema.extend({
  id: z.string().cuid(),
  products: z.array(z.string()).optional(),
  imageId: z.string().nullish(),
});
