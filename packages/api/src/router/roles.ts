import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

import { findById } from "../schemas/generalSchema";
import {
  createRoleSchema,
  orderRoleSchema,
  updateRoleSchema,
} from "../schemas/roleSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

export const rolesRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await ctx.prisma.role.create({
          data: {
            name: input.name.toLowerCase(),
            type: input.type,
            discount: input.type === "client" ? input.discount ?? 0 : null,
            permissions: {
              create:
                input.type === "team"
                  ? input.permissions?.map((p) => ({
                      permission: {
                        connect: {
                          name: p,
                        },
                      },
                    }))
                  : [],
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
      return ctx.prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
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
    .input(updateRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, permissions: perm, ...data } = input;

        return await ctx.prisma.role.update({
          where: { id },
          data: {
            ...data,
            discount: data.type === "client" ? data.discount : null,
            permissions: {
              deleteMany: {},
              create:
                data.type === "team"
                  ? perm?.map((p) => ({
                      permission: {
                        connect: {
                          name: p,
                        },
                      },
                    }))
                  : [],
            },
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // order
  order: protectedProcedure
    .input(orderRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (input) {
          for (const rol of input) {
            const { id, hierarchy } = rol;
            await await ctx.prisma.role.update({
              where: { id },
              data: {
                hierarchy: hierarchy,
              },
            });
          }
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
        return await ctx.prisma.role.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
