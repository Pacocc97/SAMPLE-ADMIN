import z from "zod";

/** Create Category */
export const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type signinValues = z.infer<typeof signinSchema>;

// export const createCommentSchema = signinSchema.extend({
//   id: z.string(),
//   parentId: z.string().nullish(),
//   commenting: z.string(),
//   subComment: z.boolean(),
// });
