import z from "zod";

/** Create Image */
export const createImageSchema = z.object({
  path: z.string().min(1),
  original: z.string().min(1),
  webp: z.string().min(1),
  blur: z.string().min(1),
  width: z.number().min(1),
  height: z.number().min(1),
});

export const createImageFromBase64Schema = z.object({
  image: z.string().regex(/data:image\/(png|jpeg|jpg);base64,/),
  path: z.string().min(1),
  name: z.string().optional(),
  size: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  alt: z.string().nullish(),
});

export type CreateImageInput = z.TypeOf<typeof createImageSchema>;

/** Update Image */
export const updateImageFormSchema = createImageSchema.extend({
  alt: z.string().nullish(),
});

export type UpdateImageFormValues = z.infer<typeof updateImageFormSchema>;

export const updateImageSchema = updateImageFormSchema.extend({
  id: z.string().cuid(),
});
