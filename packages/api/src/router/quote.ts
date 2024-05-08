import { findById } from "../schemas/generalSchema";
import {
  createQuoteFormSchema,
  saveQuoteFormSchema,
} from "../schemas/quoteSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

export const quoteRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.quotation.findMany({
      include: {
        pdf: true,
        user: true,
        products: {
          include: {
            product: {
              include: {
                image: true,
              },
            },
          },
        },
      },
    });
  }),

  // create
  create: publicProcedure
    .input(createQuoteFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { products, user } = input;

      const productArray = await ctx.prisma.product.findMany({
        where: {
          id: { in: products },
        },
        include: {
          image: true,
        },
      });

      const userData = user
        ? await ctx.prisma.user.findUnique({
            where: { email: user },
          })
        : null;
      const roleData = userData
        ? await ctx.prisma.role.findUnique({
            where: { id: userData?.roleId || undefined },
          })
        : null;

      try {
        const res = await ctx.prisma.quotation.create({ data: {} });
        const resObj = {
          products: productArray,
          user: userData,
          discount: roleData?.discount || 0,
          role: roleData?.name || null,
          id: res.id,
        };
        return resObj;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // save
  save: publicProcedure
    .input(saveQuoteFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { products, user, pdfId, id } = input;

      const productArray = await ctx.prisma.product.findMany({
        where: {
          id: { in: products.map(({ id }) => id) },
        },
        include: {
          image: true,
        },
      });
      const userData = user
        ? await ctx.prisma.user.findUnique({
            where: { email: user },
          })
        : null;
      const roleData = userData
        ? await ctx.prisma.role.findUnique({
            where: { id: userData?.roleId || undefined },
          })
        : null;

      const resObj = {
        products: productArray.map(({ id }) => id),
        user: userData?.id,
        discount: roleData?.discount || 0,
      };
      try {
        return ctx.prisma.quotation.update({
          where: { id },
          data: {
            ...resObj,
            user: userData?.id
              ? {
                  connect: {
                    id: userData.id,
                  },
                }
              : undefined,
            pdf: pdfId
              ? {
                  connect: {
                    id: pdfId,
                  },
                }
              : undefined,
            products: {
              create: productArray.map((p) => ({
                quantity: products.find((product) => product.id === p.id)
                  .quantity,
                currentPrice: roleData?.discount
                  ? Math.round((1 - roleData?.discount / 10000) * p.price)
                  : p.price,
                product: {
                  connect: {
                    id: p.id,
                  },
                },
              })),
            },
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findById).query(({ input, ctx }) => {
    const { id } = input;
    try {
      return ctx.prisma.quotation.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          pdf: true,
          products: {
            include: {
              product: {
                include: {
                  image: true,
                },
              },
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
        return ctx.prisma.quotation.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
