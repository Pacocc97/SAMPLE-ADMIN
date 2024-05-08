import z from "zod";

import { ProducerSchema } from "../schemas/producerSchema";
import { createSeoFormSchema } from "./seoSchema";

/** Create Product */
export const createProductFormSchema = z.object({
  name: z
    .string({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres")
    .max(100, "Este campo tiene que llevar menos de 32 caracteres"),
  brand: z
    .string({
      invalid_type_error: "Porfavor ingrese texto",
    })
    .min(2, "Este campo tiene que llevar más de dos caracteres")
    .max(32, "Este campo tiene que llevar menos de 32 caracteres")
    .nullable(),
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
  suggestedPrice: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" })
    .gte(100)
    .lte(99999999999)
    .optional(),
  currency: z
    .string({
      invalid_type_error: "Porfavor ingrese texto",
    })
    .max(3, "Este campo tiene que llevar menos de 3 caracteres")
    .default("MXN")
    .nullable(),
  SKU: z
    .string({
      invalid_type_error: "Porfavor ingrese texto",
    })
    .max(9, "Este campo tiene que llevar menos de 9 caracteres")
    .nullable(),
  barcode: z
    .string({
      invalid_type_error: "Porfavor ingrese texto",
    })
    .max(20, "Este campo tiene que llevar menos de 20 caracteres")
    .nullable(),
  stock: z
    .number({
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  stockWarn: z
    .number({
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  height: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  width: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  length: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  weight: z
    .number({
      required_error: "Este campo es requerido",
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" }),
  type: z.string().optional(),
  unit: z
    .string({
      // required_error: 'Elija una opción o cree una',
      invalid_type_error: "Valor inválido",
    })
    .optional(),
  Subcategory1: z.unknown().nullable(),
  tags: z
    .string({
      required_error: "Ingrese por lo menos una etiqueta",
      invalid_type_error: "Porfavor ingrese texto",
    })
    .array(),
  producer: z.object({
    producer: ProducerSchema.nullish(),
    price: z.number().nullish(),
    delivery: z.number().nullish(),
  }).array(),
  attributes: z
    .array(
      z
        .object({
          value: z
            .string()
            .or(z.number())
            .or(
              z.object({
                low: z.number(),
                high: z.number(),
              }),
            )
            .nullish(),
          name: z.string(),
          type: z.string().nullish(),
          unit: z.string().nullish(),
          id: z.string()
        })
        .nullish(),
    )
    .nullish(),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const createProductSchema = createProductFormSchema.extend({
  category: z.string().array().optional(),
  brochureId: z.string().nullish(),
  manualId: z.string().nullish(),
  imageId: z.string().optional(),
  imagesExtra: z.string().array().nullish(),
  gifId: z.string().optional(),
  user: z.string().nullish(),
  approval: z.string().array().optional(),
});

/** Update Product */
export const updateProductFormSchema = createProductFormSchema.extend({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  seo: createSeoFormSchema.nullish(),
});

export type UpdateProductFormValues = z.infer<typeof updateProductFormSchema>;

export const updateProductSchema = updateProductFormSchema.extend({
  id: z.string().cuid(),
  imageId: z.string().optional(),
  seoId: z.string().optional(),
  gifId: z.string().optional(),
  brochureId: z.string().nullish(),
  manualId: z.string().nullish(),
  imagesExtra: z.string().array().optional(),
  idImagesAd: z.string().array().optional(),
  arrayImages: z.string().array().optional(),
  category: z.string().array().optional(),
  user: z.string().nullish(),
  producerCategories: z.array(z.string().optional()).optional(),
  complement: z.array(z.string()).optional(),
  relation: z.array(z.string()).optional(),
  parts: z.array(z.string()).optional(),
});

export const authorizeProductSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(["admin", "seo", "design"]),
  prevAuth: z.string().array(),
  user: z.string(),
});

export type AuthorizeProductFormValues = z.infer<typeof authorizeProductSchema>;

/** Call Product */
export const callProductsSchema = z.object({
  cartArray: z.string().array(),
});
