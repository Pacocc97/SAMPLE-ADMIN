import z from "zod";

/** Create Role */
export const createRoleFormSchema = z.object({
  name: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  type: z.string({ required_error: "No deje vacío este campo" }),
  discount: z
    .number({
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" })
    .lte(10000)
    .nullish(),
});

export const orderRoleSchema = z
  .array(
    z.object({
      id: z.string().cuid().optional(),
      hierarchy: z.number().nullish(),
    }),
  )
  .optional();

export type CreateRoleFormValues = z.infer<typeof createRoleFormSchema>;

export const createRoleSchema = createRoleFormSchema.extend({
  permissions: z.array(z.string()).optional(),
});

/** Update Role */
export const updateRoleFormSchema = createRoleFormSchema.extend({
  name: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  discount: z
    .number({
      invalid_type_error: "Porfavor ingrese numeros",
    })
    .positive({ message: "No ingrese valores negativos" })
    .lte(10000)
    .nullish(),
});

export type UpdateRoleFormValues = z.infer<typeof updateRoleFormSchema>;

export const updateRoleSchema = updateRoleFormSchema.extend({
  id: z.string().cuid().optional(),
  permissions: z.array(z.string()).optional(),
});
