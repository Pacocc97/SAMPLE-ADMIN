import type { Prisma } from "@prisma/client";

import { findById, findBySlug } from "../schemas/generalSchema";
import {
  authorizeProductSchema,
  callProductsSchema,
  createProductSchema,
  updateProductSchema,
} from "../schemas/productSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { hasPermission } from "../utils/authorization/permission";
import { handleTRPCError } from "../utils/errorHandler";
import { slugify } from "../utils/string";

function checkArr(prevAuth: any, role: any) {
  const newArr = prevAuth;
  if (!newArr.includes(role)) {
    newArr?.push(role);
    return newArr;
  } else {
    const index: number = newArr?.indexOf(role) || -1;
    newArr?.splice(index, 1);
    return newArr;
  }
}

export const productRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany({
      include: {
        producer: {
          include: {
            producer: {
              include: {
                logo: true,
              },
            },
          },
        },
        Gif: true,
        image: true,
        // openGraphBasicImage: true,
        brochure: true,
        manual: true,
        ImagesExtra: {
          include: {
            image: true,
          },
        },
        Category: {
          include: {
            child: {
              include: {
                child: true,
              },
            },
            parent: true,
          },
        },
        seo: {
          include: {
            openGraphBasicImage: true,
          },
        },
      },
    });
  }),

  // allAstro
  allAstro: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.product.findMany({
      where: {
        approval: {
          has: 'admin',
        },
      },
      include: {
        producer: {
          include: {
            producer: {
              include: {
                logo: true,
              },
            },
          },
        },
        Gif: true,
        image: true,
        // openGraphBasicImage: true,
        brochure: true,
        manual: true,
        ImagesExtra: {
          include: {
            image: true,
          },
        },
        Category: {
          include: {
            child: {
              include: {
                child: true,
              },
            },
            parent: true,
          },
        },
        seo: {
          include: {
            openGraphBasicImage: true,
          },
        },
      },
    });
  }),

  // cart
  cart: publicProcedure.input(callProductsSchema).query(({ input, ctx }) => {
    const { cartArray } = input;
    return ctx.prisma.product.findMany({
      where: {
        id: {
          in: cartArray,
        },
      },
      include: {
        image: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { category, producer, imagesExtra, user, attributes, type, imageId, gifId, brochureId, manualId, unit, ...data } =
          input; // eslint-disable-line @typescript-eslint/no-unused-vars
        const miCategory: string[] | undefined = input.category;
        const imgExtra: string[] | null | undefined = input.imagesExtra;
        const usuarioId: string =
          typeof input.user === "string" ? input.user : "";
        return await ctx.prisma.product.create({
          data: {
            ...data,
            approval: ["draft"],
            slug: await slugify(input.name, "product"),
            Category: {
              connect: miCategory?.map((category: string) => ({
                id: category,
              })) || undefined,
            },
            image: {
              connect: {
                id: imageId,
              },
            },
            Gif: {
              connect: {
                id: gifId,
              },
            },
            brochure: {
              connect: {
                id: brochureId || '',
              },
            },
            manual: {
              connect: {
                id: manualId || '',
              },
            },
            ProductUnit: {
              connect: {
                name: unit,
              },
            },
            // producer: {
            //   connect: producer?.map((producer) => ({
            //     id: producer.id,
            //   })),
            // },
            producer: {
              create: producer?.map(({ producer }) => ({
                producer: {
                  connect: {
                    id: producer?.id || "",
                  },
                },
              })) || undefined,
            },
            ImagesExtra: {
              create: imgExtra?.map((extra: string, index: number) => ({
                orden: index + 1,//imgExtra?.length,
                image: {
                  connect: {
                    id: extra,
                  },
                },
              })) || undefined,
            },
            ProductHistory: {
              create: {
                type: "create",
                user: {
                  connect: {
                    id: usuarioId,
                  },
                },
              },
            },
            ProductType: {
              connect: {
                name: type,
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
      return ctx.prisma.product.findUnique({
        where: { slug },
        include: {
          complements: {
            include: {
              complement: {
                include: {
                  image: true,
                  Category: true,
                },
              },
            },
          },
          relations: {
            include: {
              relation: {
                include: {
                  image: true,
                  Category: true,
                },
              },
            },
          },
          parts: {
            include: {
              parts: {
                include: {
                  image: true,
                  Category: true,
                },
              },
            },
          },
          // producer: {
          //   include: {
          //     product: {
          //       include: {
          //         Category: {
          //           include: {
          //             child: true,
          //             parent: true,
          //           },
          //         },
          //       },
          //     },
          //     logo: true,
          //   },
          // },
          producer: {
            include: {
              product: {
                include: {
                  Category: {
                    include: {
                      child: true,
                      parent: true,
                    },
                  },
                },
              },
              producer: {
                include: {
                  product: {
                    include: {
                      product: {
                        include: {
                          Category: {
                            include: {
                              child: true,
                              parent: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  logo: true,
                },
              },
            },
          },
          Gif: true,
          image: true,
          ImagesExtra: {
            include: {
              image: true,
            },
          },
          brochure: true,
          manual: true,
          Category: {
            include: {
              child: true,
              parent: true,
            },
          },
          ProductHistory: {
            include: {
              user: {
                include: {
                  role: true,
                },
              },
              Product: true,
            },
          },
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
    .input(updateProductSchema)
    .mutation(async ({ input, ctx }) => {
      const canUpdateSlug = hasPermission(ctx.session, "update_producto_slug");

      if (!canUpdateSlug.status) {
        delete input.slug;
      }

      try {
        const {
          id,
          imagesExtra,
          idImagesAd,
          arrayImages,
          category,
          Subcategory1,
          user,
          producer,
          producerCategories,
          complement,
          relation,
          parts,
          attributes,
          seo: SEO,
          ...data
        } = input;
        const { ...seoinfo } = SEO;
        return await ctx.prisma.product.update({
          where: { id },
          data: {
            ...data,
            attributes: attributes as
              | Prisma.NullableJsonNullValueInput
              | Prisma.InputJsonValue
              | undefined,
            complements: {
              deleteMany: {},
              create: complement?.map((c) => ({
                complement: {
                  connect: {
                    id: c,
                  },
                },
              })),
            },
            relations: {
              deleteMany: {},
              create: relation?.map((c) => ({
                relation: {
                  connect: {
                    id: c,
                  },
                },
              })),
            },
            parts: {
              deleteMany: {},
              create: parts?.map((c) => ({
                parts: {
                  connect: {
                    id: c,
                  },
                },
              })),
            },
            Category: {
              set: category?.map((category: string) => ({
                id: category,
              })),
            },
            producer: {
              deleteMany: {},
              create: producer?.map(({ producer, price, delivery }) => ({
                price: price,
                delivery: delivery,
                producer: {
                  connect: {
                    id: producer?.id,
                  },
                },
              })),
              // update: producer?.map((producer) => ({
              //   where: { id: producer.id },
              //   data: { categories: producerCategories },
              // })),
            },
            seo: {
              update: {
                ...seoinfo,
              },
            },
            ImagesExtra: {
              create: imagesExtra?.map((extra: string) => ({
                orden: arrayImages?.length,
                image: {
                  connect: {
                    id: extra,
                  },
                },
              })),
              update: idImagesAd?.map((idImage: string) => {
                return {
                  where: {
                    imageId_productId: {
                      imageId: idImage,
                      productId: id,
                    },
                  },
                  data: { orden: arrayImages?.indexOf(idImage) },
                };
              }),
            },
            ProductHistory: {
              create: {
                type: "edit",
                user: {
                  connect: {
                    id: user as string,
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

  // authorize
  authorize: protectedProcedure
    .input(authorizeProductSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, role, prevAuth, user } = input;
        const usuarioId: string = typeof user === "string" ? user : "";

        return await ctx.prisma.product.update({
          where: { id },
          data: {
            approval: checkArr(prevAuth, role),
            ProductHistory: {
              create: {
                type: prevAuth.includes(role) ? "approve" : "disapprove",
                user: {
                  connect: {
                    id: usuarioId,
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
        return await ctx.prisma.product.delete({
          where: { id },
          select: {
            ProductHistory: true,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
