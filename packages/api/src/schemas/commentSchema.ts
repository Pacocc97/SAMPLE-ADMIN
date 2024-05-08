import z from "zod";

/** Create Category */
export const createMessageFormSchema = z.object({
  comment: z.string().nullish(),
  replyComment: z.string().nullish(),
});

export type CreateMessageFormValues = z.infer<typeof createMessageFormSchema>;

export const createCommentSchema = createMessageFormSchema.extend({
  id: z.string(),
  parentId: z.string().nullish(),
  commenting: z.string(),
  subComment: z.boolean(),
});
