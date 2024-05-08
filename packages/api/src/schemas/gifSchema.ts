import z from "zod";

/** Create Gif */
export const createGifSchema = z.object({
  path: z.string().min(1),
  original: z.string().min(1),
  width: z.number().min(1),
  height: z.number().min(1),
});

export const createGifFromBase64Schema = z.object({
  image: z.string().regex(/data:image\/(gif);base64,/),
  path: z.string().min(1),
  name: z.string().optional(),
  size: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  alt: z.string().nullish(),
});

export type CreateGifInput = z.TypeOf<typeof createGifSchema>;

/** Update Gif */
export const updateGifFormSchema = createGifSchema.extend({
  alt: z.string().nullish(),
});

export type UpdateGifFormValues = z.infer<typeof updateGifFormSchema>;

export const updateGifSchema = updateGifFormSchema.extend({
  id: z.string().cuid(),
});
