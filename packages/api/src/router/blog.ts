import { createBlogSchema, updateBlogSchema } from "../schemas/blogSchema";
import { findById, findBySlug } from "../schemas/generalSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";

export const blogRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.blog.findMany({
      include: {
        image: true,
        BlogCategory: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createBlogSchema)
    .mutation(async ({ input, ctx }) => {
      const { imageId, draft, BlogCategory, ...data } = input;
      try {
        return await ctx.prisma.blog.create({
          data: {
            ...data,
            slug: await slugify(input.title, "blog"),
            draft: true,
            image: {
              connect: {
                id: imageId,
              },
            },
            BlogCategory: {
              connect: BlogCategory?.map((cat: string) => ({
                id: cat,
              })),
            },
            seo: {
              create: {},
            },
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findBySlug).query(({ input, ctx }) => {
    const { slug } = input;
    try {
      return ctx.prisma.blog.findUnique({
        where: { slug },
        include: {
          image: true,
          BlogCategory: true,
          seo: {
            include: {
              openGraphBasicImage: true,
            },
          },
        },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // update
  update: protectedProcedure
    .input(updateBlogSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, seo: SEO, BlogCategory, publish, ...data } = input;
        const { ...seoinfo } = SEO;
        return await ctx.prisma.blog.update({
          where: { id },
          data: {
            ...data,
            BlogCategory: {
              set: BlogCategory?.map((cat: string) => ({
                id: cat,
              })),
            },
            seo: {
              update: {
                ...seoinfo,
              },
            },
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  delete: protectedProcedure
    .input(findById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      try {
        return await ctx.prisma.blog.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
