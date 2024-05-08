import z from "zod";

/** Create Order */
export const createOrderFormSchema = z.object({
  shippingAddress: z.object({
    street: z.string(),
    apartmentNumber: z.string().nullish(),
    streetNumber: z.string(),
    neighborhood: z.string(),
    municipality: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }),
  billingAddress: z.object({
    street: z.string(),
    apartmentNumber: z.string().nullish(),
    streetNumber: z.string(),
    neighborhood: z.string(),
    municipality: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }),
});

export type CreateOrderFormValues = z.infer<typeof createOrderFormSchema>;

export const createOrderSchema = createOrderFormSchema.extend({
  openPayId: z.string(),
  productArray: z
    .object({
      id: z.string(),
      currentPrice: z.number(),
      quantity: z.number(),
    })
    .array(),
});

/** Update Order */
// export const updateOrderFormSchema = createOrderFormSchema.extend({});

// export type UpdateOrderFormValues = z.infer<typeof updateOrderFormSchema>;

// export const updateOrderSchema = updateOrderFormSchema.extend({
//   id: z.string().cuid(),
// });
