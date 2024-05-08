import z from "zod";

export const findBySlug = z.object({
  slug: z.string().min(1),
});

export const findById = z.object({
  id: z.string(),
});

export const findUser = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
});

export const findByEmail = z.object({
  email: z.string(),
});

export const findByName = z.object({
  name: z.string(),
});

export const findByOriginal = z.object({
  original: z.string(),
});

export const findBySrc = z.object({
  src: z.string(),
});

export const findByValue = z.object({
  value: z.string(),
});

export const findImageById = z.object({
  id: z.string(),
  path: z.string().min(1),
  original: z.string(),
  webp: z.string(),
});

export const findGifById = z.object({
  id: z.string(),
  path: z.string().min(1),
  original: z.string(),
});

export const findPdfById = z.object({
  id: z.string(),
  path: z.string().min(1),
  original: z.string(),
});

