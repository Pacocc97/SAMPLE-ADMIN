import {
  createCategoryBlogSchema,
  updateCategoryBlogSchema,
} from "../schemas/categoryBlogSchema";
import { findById, findBySlug } from "../schemas/generalSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";

export const categoryBlogRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.blogCategory.findMany({
      include: {
        parent: true,
        child: true,
        image: true,
        seo: true,
        Blog: {
          include: {
            image: true,
          },
        },
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createCategoryBlogSchema)
    .mutation(async ({ input, ctx }) => {
      const { parentValue, name, imageId, ...data } = input;

      try {
        if (input.parentValue != null) {
          return await ctx.prisma.blogCategory.create({
            data: {
              ...data,
              slug: await slugify(name, "categoryBlog"),
              name: name,
              image: imageId
                ? {
                    connect: {
                      id: imageId,
                    },
                  }
                : undefined,
              parent: {
                connect: {
                  id: parentValue,
                },
              },
              seo: {
                create: {},
              },
            },
          });
        } else {
          return await ctx.prisma.blogCategory.create({
            data: {
              ...data,
              name: input.name,
              slug: await slugify(input.name, "categoryBlog"),
              image: imageId
                ? {
                    connect: {
                      id: imageId,
                    },
                  }
                : undefined,
              seo: {
                create: {},
              },
            },
          });
        }
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findBySlug).query(({ input, ctx }) => {
    const { slug } = input;
    try {
      return ctx.prisma.blogCategory.findUnique({
        where: { slug },
        include: {
          seo: {
            include: {
              openGraphBasicImage: true,
            },
          },
          child: { include: { image: true } },
          parent: true,
          image: true,
          Blog: {
            include: {
              image: true,
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
    .input(updateCategoryBlogSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { checked, seo: SEO } = input;
        const { ...seoinfo } = SEO;
        if (checked) {
          const { id, checked, ...data } = input;
          return await ctx.prisma.blogCategory.update({
            where: { id },
            data: {
              ...data,
              Blog: {
                set: [],
              },
              seo: {
                update: {
                  ...seoinfo,
                },
              },
            },
          });
        } else {
          const { id, checked, parentId, ...data } = input;
          return await ctx.prisma.blogCategory.update({
            where: { id },
            data: {
              ...data,
              seo: {
                update: {
                  ...seoinfo,
                },
              },
            },
          });
        }
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
        return await ctx.prisma.blogCategory.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
