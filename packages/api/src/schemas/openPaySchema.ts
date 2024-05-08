import z from "zod";

/** Create OpenPay */
export const createOpenPayFormSchema = z.object({
  source_id: z.string(),
  device_session_id: z.string(),
  status: z.string().optional(),
  userId: z.string().nullish(),
  client_name: z.string().nullish(),
  email: z.string().nullish(),
  productArray: z.any().array(),
});

export type CreateOpenPayFormValues = z.infer<typeof createOpenPayFormSchema>;

export const createOpenPaySchema = createOpenPayFormSchema.extend({
  // openPayId: z.string(),
});

/** Update OpenPay */
// export const updateOpenPayFormSchema = createOpenPayFormSchema.extend({});

// export type UpdateOpenPayFormValues = z.infer<typeof updateOpenPayFormSchema>;

// export const updateOpenPaySchema = updateOpenPayFormSchema.extend({
//   id: z.string().cuid(),
// });
