import Fuse from "fuse.js";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { findByValue } from "./../schemas/generalSchema";

export const searchsRouter = createTRPCRouter({
  // all
  all: publicProcedure.input(findByValue).query(async ({ input, ctx }) => {
    const { value } = input;

    const options = {
      includeScore: true,
      keys: ["name"],
    };
    const list = await ctx.prisma.product.findMany({
      include: {
        image: true,
        Category: true,
      },
    });
    try {
      if (value) {
        const fuse = new Fuse(list, options);
        return fuse.search(value);
      }
    } catch (err) {
      handleTRPCError(err);
    }
  }),
});
