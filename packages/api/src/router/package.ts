import { findById, findBySlug } from "../schemas/generalSchema";
import {
  createPackageSchema,
  updatePackageSchema,
} from "../schemas/packageSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";

export const packageRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.productPackage.findMany({
      include: {
        products: {
          include: {
            image: true,
          },
        },
        image: true,
        seo: {
          include: {
            openGraphBasicImage: true,
          },
        },
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createPackageSchema)
    .mutation(async ({ input, ctx }) => {
      const { products, imageId, ...data } = input;
      try {
        return await ctx.prisma.productPackage.create({
          data: {
            ...data,
            slug: await slugify(input.name, "package"),
            products: {
              connect: products?.map((product: string) => ({
                id: product,
              })),
            },
            image: {
              connect: {
                id: imageId,
              },
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
      return ctx.prisma.productPackage.findUnique({
        where: { slug },
        include: {
          products: {
            include: {
              image: true,
              Category: true,
            },
          },
          image: true,
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
    .input(updatePackageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, products, seo: SEO, ...data } = input;
        const { ...seoinfo } = SEO;
        return await ctx.prisma.productPackage.update({
          where: { id },
          data: {
            ...data,
            products: {
              set: products?.map((product: string) => ({
                id: product,
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
        return await ctx.prisma.productPackage.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
