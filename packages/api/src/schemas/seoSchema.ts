import z from "zod";

/** Create Seo */
export const createSeoFormSchema = z.object({
  title: z.string({}).nullish(),
  descriptionMeta: z.string({}).nullish(),
  canonical: z.string({}).nullish(),
  noindex: z.boolean({}).nullish(),
  nofollow: z.boolean({}).nullish(),
  charset: z.string({}).nullish(),
  openGraphBasicTitle: z.string({}).nullish(),
  openGraphBasicType: z.string({}).nullish(),
  openGraphBasicUrl: z.string({}).nullish(),
  openGraphOptionalAudio: z.string({}).nullish(),
  openGraphOptionalDescription: z.string({}).nullish(),
  openGraphOptionalDeterminer: z.string({}).nullish(),
  openGraphOptionalLocale: z.string({}).nullish(),
  openGraphOptionalLocaleAlternate: z.string({}).nullish(),
  openGraphOptionalSiteName: z.string({}).nullish(),
  openGraphOptionalVideo: z.string({}).nullish(),
  openGraphImageUrl: z.string({}).nullish(),
  openGraphImageSecureUrl: z.string({}).nullish(),
  openGraphImageType: z.string({}).nullish(),
  openGraphImageWidth: z.number({}).nullish(),
  openGraphImageHeight: z.number({}).nullish(),
  openGraphImageAlt: z.string({}).nullish(),
  openGraphArticleAuthor: z.string({}).nullish(),
  openGraphArticleSection: z.string({}).nullish(),
  openGraphArticleTags: z.string().array().optional(), //array(z.string().optional()).optional(),
  twitterCard: z.string({}).nullish(),
  twitterSite: z.string({}).nullish(),
  twitterCreator: z.string({}).nullish(),
  openGraphBasicImageId: z.string().optional(),
});

export type CreateSeoFormValues = z.infer<typeof createSeoFormSchema>;

export const createSeoSchema = createSeoFormSchema.extend({
  openGraphBasicImageId: z.string().nullish(),
});

/** Update Seo */
export const updateSeoFormSchema = createSeoFormSchema.extend({});

export type UpdateSeoFormValues = z.infer<typeof updateSeoFormSchema>;

export const updateSeoSchema = updateSeoFormSchema.extend({
  id: z.string().cuid(),
  openGraphBasicImageId: z.string().nullish(),
});
