import { findById } from "../schemas/generalSchema";
import { createOrderSchema } from "../schemas/orderSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

export const orderRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.order.findMany({
      include: {
        openPay: {
          include: {
            user: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }),

  // create
  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { openPayId, productArray, ...data } = input;
        return ctx.prisma.order.create({
          data: {
            ...data,
            // totalPrice: productArray
            //   .map((p) => p.quantity * p.currentPrice)
            //   .reduce((acc, curr) => acc + curr, 0),
            products: {
              create: productArray.map((p) => ({
                quantity: p.quantity,
                currentPrice: p.currentPrice,
                product: {
                  connect: {
                    id: p.id,
                  },
                },
              })),
            },
            openPay: {
              connect: {
                id: openPayId,
              },
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
      return ctx.prisma.order.findUnique({
        where: { id },
        include: {
          openPay: true,
          products: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // update
  // update: protectedProcedure
  //   .input(updateOrderSchema)
  //   .mutation(async ({ input, ctx }) => {
  //     try {
  //       const { id, ...data } = input;
  //       return ctx.prisma.order.update({
  //         where: { id },
  //         data,
  //       });
  //     } catch (error) {
  //       handleTRPCError(error);
  //     }
  //   }),

  // delete
  delete: protectedProcedure
    .input(findById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      try {
        return ctx.prisma.order.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
