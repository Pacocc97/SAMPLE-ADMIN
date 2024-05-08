import z from "zod";

/** Create Client */
export const createUserFormSchema = z.object({
  name: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  email: z.string().optional(),
  password: z.string(),
  contactMails: z.array(z.string().min(6).max(34)).nullish(),
  contactPhones: z.array(z.string().min(5).max(15)).nullish(),
  rol: z.string().cuid().nullish(),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const createUserSchema = createUserFormSchema.extend({
  pictureId: z.string().optional(),
});

export const updateUserSchema = createUserFormSchema.extend({
  id: z.string().cuid(),
  pictureId: z.string().nullish(),
  userType: z.string().optional(),
});

export const disableUserSchema = z.object({
  id: z.string().cuid(),
  disable: z.boolean(),
});

export const partialDeleteUserSchema = z.object({
  id: z.string().cuid(),
  deletedAt: z.date().nullable(),
});

export const updateProfileFormSchema = z.object({
  userFirstName: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
  userLastName: z
    .string({ required_error: "No deje vacío este campo" })
    .min(2, "Escriba por lo menos dos letras")
    .max(32),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileFormSchema>;

export const updateProfileSchema = updateProfileFormSchema.extend({
  id: z.string().cuid(),
  pictureId: z.string().nullish(),
});
