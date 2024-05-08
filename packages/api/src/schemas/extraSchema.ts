import z from "zod";

/** Create Unidad */
export const createUnitFormSchema = z.object({
  name: z.string({ required_error: "No deje vacío este campo" }).min(2).max(32),
});

export type CreatUnitFormValues = z.infer<typeof createUnitFormSchema>;

/** Create Tipo */
export const createTypeFormSchema = z.object({
  name: z.string({ required_error: "No deje vacío este campo" }).min(2).max(32),
});

export type CreateTypeFormValues = z.infer<typeof createTypeFormSchema>;
