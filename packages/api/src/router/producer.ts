import { findById, findBySlug } from "../schemas/generalSchema";
import {
  createProducerSchema,
  updateProducerSchema,
} from "../schemas/producerSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";

export const producerRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.producer.findMany({
      include: {
        product: {
          include: {
            product: {
              include: {
                image: true,
                Category: {
                  include: {
                    child: true,
                    parent: true,
                  },
                }, 
              }
            }
          }
        },
        logo: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createProducerSchema)
    .mutation(async ({ input, ctx }) => {
      const { product, categories, ...data } = input;
      try {
        return await ctx.prisma.producer.create({
          data: {
            ...data,
            slug: await slugify(input.name, "producer"),
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
      return ctx.prisma.producer.findUnique({
        where: { slug },
        include: {
          product: {
            include: {
              product: {
                include: {
                  image: true,
                  Category: {
                    include: {
                      child: true,
                      parent: true,
                    },
                  },
                }
              }
            }
          },
          logo: true,
        },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // update
  update: protectedProcedure
    .input(updateProducerSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, product, categories, ...data } = input;
      const categoryArray = categories;
      try {
        return await ctx.prisma.producer.update({
          where: { id },
          data: {
            ...data,
            categories: categoryArray,
            product: {
              deleteMany: {},
              create: product?.map(({product, price, delivery}) => ({
                price: price,
                delivery: delivery,
                product: {
                  connect: {
                    id: product.id
                  }
                }
              }))
            }
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
        return await ctx.prisma.producer.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
