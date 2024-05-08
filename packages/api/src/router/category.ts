import type { Prisma } from "@prisma/client";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema";
import { findById, findBySlug } from "../schemas/generalSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";
import { createId } from '@paralleldrive/cuid2';


async function updateAttributes(prevData: any, passedChar: any, ctx: any) {
  if (prevData?.Product.map((p: any) => p)) {
    for (let products of prevData?.Product.map((p: any) => p)) {
      const attArr = []
      for (let attribute of products?.attributes) {
        const charForAtt = passedChar.find((c: any) => c?.id === attribute?.id)
        const obj = charForAtt && { ...attribute, name: charForAtt.name, unit: charForAtt.unit }
        attArr.push(obj)
      }
      await ctx.prisma.product.update({
        where: { id: products.id },
        data: {
          ...products,
          attributes: attArr.filter(x => x)
        }
      })
    }
  }
}

export const categoryRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      include: {
        parent: true,
        child: true,
        image: true,
        seo: true,
        Product: {
          include: {
            image: true,
            Category: true,
          },
        },
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { parentValue, name, imageId, ...data } = input;
        if (input.parentValue != null) {
          return await ctx.prisma.category.create({
            data: {
              ...data,
              slug: await slugify(name, "category"),
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
          return await ctx.prisma.category.create({
            data: {
              ...data,
              name: input.name,
              slug: await slugify(input.name, "category"),
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
      return ctx.prisma.category.findUnique({
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
          Product: {
            include: {
              image: true,
              Category: true,
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
    .input(updateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { checked, seo: SEO } = input;
        const { ...seoinfo } = SEO;
        if (checked) {
          const { id, characteristics, checked, ...data } = input;
          const prevData = await ctx.prisma.category.findUnique({
            where: { id },
            include: {
              Product: true,
            }
          })
          const passedChar = characteristics.map(d => { return d?.id ? d : { id: createId(), ...d } })


          return [await ctx.prisma.category.update({
            where: { id },
            data: {
              ...data,
              Product: {
                set: [],
              },
              seo: {
                update: {
                  ...seoinfo,
                },
              },
              characteristics:
                characteristics && (characteristics.map(d => { return d?.id ? d : { id: createId(), ...d } }) as Prisma.JsonArray),
            },
          }), updateAttributes(prevData, passedChar, ctx)];
        } else {
          const { id, characteristics, checked, parentId, ...data } = input;
          const prevData = await ctx.prisma.category.findUnique({
            where: { id },
            include: {
              Product: true,
            }
          })
          const passedChar = characteristics.map(d => { return d?.id ? d : { id: createId(), ...d } })


          return [await ctx.prisma.category.update({
            where: { id },
            data: {
              ...data,
              seo: {
                update: {
                  ...seoinfo,
                },
              },
              characteristics: passedChar as Prisma.JsonArray,
            },
          }), updateAttributes(prevData, passedChar, ctx)];
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
        return await ctx.prisma.category.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // sectioned
  sectioned: publicProcedure.query(async ({ ctx }) => {
    const categoryParent = ctx.prisma.category.findMany({
      where: { parentId: null },
      include: {
        parent: true,
        child: true,
        image: true,
      },
    });
    function splitArray(arr: string | any[], chunkSize: number) {
      let result = [];
      if (arr)
        for (let i = 0; i < arr.length; i += chunkSize) {
          let chunk = arr.slice(i, i + chunkSize);
          result.push(chunk);
        }

      return result;
    }
    return splitArray(await categoryParent, (await categoryParent)?.length / 3);
  }),
});
