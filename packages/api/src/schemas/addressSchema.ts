import z from "zod";

/** Create Address */
export const createAddressFormSchema = z.object({
  identifier: z.string({ required_error: "No deje vacío este campo" }),
  street: z.string({ required_error: "No deje vacío este campo" }),
  streetNumber: z.string({ required_error: "No deje vacío este campo" }),
  apartmentNumber: z.string().nullish(),
  neighborhood: z.string({ required_error: "No deje vacío este campo" }),
  municipality: z.string({ required_error: "No deje vacío este campo" }),
  state: z.string({ required_error: "No deje vacío este campo" }),
  postalCode: z.string({ required_error: "No deje vacío este campo" }),
});

export type CreateAddressFormValues = z.infer<typeof createAddressFormSchema>;

export const createAddressSchema = createAddressFormSchema.extend({
  finality: z.string().optional(),
  userId: z.string().optional(),
});

/** Update Address */
export const updateAddressFormSchema = createAddressFormSchema.extend({});

export type UpdateAddressFormValues = z.infer<typeof updateAddressFormSchema>;

export const updateAddressSchema = updateAddressFormSchema.extend({
  id: z.string().cuid(),
});
