import {
  createAddressSchema,
  updateAddressSchema,
} from "../schemas/addressSchema";
import { findById } from "../schemas/generalSchema";
import { handleTRPCError } from "../utils/errorHandler";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "./../trpc";

export const addressRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.address.findMany({});
  }),

  // create
  create: publicProcedure
    .input(createAddressSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, finality, ...data } = input;
        return ctx.prisma.address.create({
          data: {
            ...data,
            finality: "shipping",
            user: userId
              ? {
                  connect: {
                    id: userId,
                  },
                }
              : undefined,
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
      return ctx.prisma.address.findUnique({
        where: { id },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // update
  update: publicProcedure
    .input(updateAddressSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        return ctx.prisma.address.update({
          where: { id },
          data,
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  delete: publicProcedure.input(findById).mutation(async ({ input, ctx }) => {
    const { id } = input;
    try {
      return ctx.prisma.address.delete({
        where: { id },
      });
    } catch (error) {
      handleTRPCError(error);
    }
  }),
});
