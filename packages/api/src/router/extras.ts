import {
  createTypeFormSchema,
  createUnitFormSchema,
} from "../schemas/extraSchema";
import { findByName } from "../schemas/generalSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

export const typeRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.productType.findMany({
      include: {
        Product: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createTypeFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.productType.create({
          data: { ...input },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findByName).query(({ input, ctx }) => {
    const { name } = input;
    try {
      return ctx.prisma.productType.findUnique({
        where: { name },
        include: {
          Product: true,
        },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // delete
  delete: protectedProcedure
    .input(findByName)
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      try {
        return await ctx.prisma.productType.delete({
          where: { name },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});

export const unitRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.productUnit.findMany({
      include: {
        Product: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createUnitFormSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.productUnit.create({
          data: { ...input },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findByName).query(({ input, ctx }) => {
    const { name } = input;
    try {
      return ctx.prisma.productUnit.findUnique({
        where: { name },
        include: {
          Product: true,
        },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // delete
  delete: protectedProcedure
    .input(findByName)
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      try {
        return await ctx.prisma.productUnit.delete({
          where: { name },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
