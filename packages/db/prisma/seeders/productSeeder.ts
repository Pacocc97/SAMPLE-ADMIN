import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient, type Gif, type Image } from "@prisma/client";
import slug from "slug";

import {
  myDesc,
  productType,
  productUnit,
  serveProduct,
} from "../data/productData";

const prisma = new PrismaClient();

type Product = {
  name: string;
  category: string;
  brand: string;
  description: string;
  shortDescription: string;
  image?: string;
  gif?: string;
  imageExtra?: string[];
  currency: string;
  SKU?: string;
  barcode: string;
  model: string;
  stock: number;
  stockWarn: number;
  price: number;
  suggestedPrice: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  tags: string[];
  approval: string[];
};

type Attributes = {
  id: string;
  type: string;
  name: string;
  unit: string;
};

type Range = {
  low: number;
  high: number;
};

type Obj = {
  id: string;
  value: string | number | Range | undefined;
  name: string;
  unit: string;
};

const dataString = JSON.stringify(myDesc);

export function productSeeder() {
  const amountOfProducts = serveProduct.length;
  const products: Product[] = [];

  for (let i = 0; i < amountOfProducts; i++) {
    const regularPrice = Math.floor(Math.random() * 999999999 - 100) + 100;
    const recommendedPrice =
      Math.floor(Math.random() * regularPrice - 100) + 100;
    const code =
      Math.floor(Math.random() * 9999999999999 - 1000000000000) + 1000000000000;
    const stockData = Math.floor(Math.random() * 100);
    const arr = ["admin", "seo", "design"];
    const out: string[] = [];
    const elements = Math.floor(Math.random() * 4);
    for (let i = 0; i < elements; i++) {
      out.push(...arr.splice(Math.floor(Math.random() * arr.length), 1));
    }

    const product: Product = {
      name: serveProduct?.[i]?.name || "",
      category: serveProduct?.[i]?.category || "",
      brand: faker.company.catchPhraseAdjective(),
      description: dataString,
      shortDescription: serveProduct?.[i]?.shortDescription || "",
      currency: "MXN",
      SKU: serveProduct?.[i]?.SKU,
      barcode: code.toString(),
      stock: stockData,
      stockWarn: Math.floor(Math.random() * 15),
      price: serveProduct?.[i]?.price || 0,
      suggestedPrice: recommendedPrice,
      image: serveProduct?.[i]?.image || undefined,
      gif: serveProduct?.[i]?.gif || undefined,
      imageExtra: serveProduct?.[i]?.imageExtra || undefined,
      height: Number(faker.random.numeric(4)),
      width: Number(faker.random.numeric(4)),
      length: Number(faker.random.numeric(4)),
      weight: Number(faker.random.numeric(5)),
      tags: ["1", "2", "a", "1a"],
      model: "",
      approval: out,
    };

    products.push(product);
  }

  return products;
}

function getRandomInt(arr: string[], num: number) {
  if (num === 0) {
    return undefined;
  } else {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

export async function generateProducts() {
  await prisma.product.deleteMany({});
  const allImages = await prisma.image.findMany({
    where: { path: "demo/images/product/image" },
  });

  const allGifs = await prisma.gif.findMany({});
  const allProducers = await prisma.producer.findMany({});
  const producer = (nu = 2) => allProducers[nu]?.id;

  const allCategories = await prisma.category.findMany({});
  const category = (nu = 2) => allCategories[nu];

  const allUsers = await prisma.user.findMany({});
  const users = (nu = 2) => allUsers[nu];

  const allPdf = await prisma.pdf.findMany({});
  try {
    for (const product of productSeeder()) {
      const categ = category(Math.floor(Math.random() * 10));
      const randomValue = Math.floor(Math.random() * 4);
      const sampleCategories = await prisma.category.findUnique({
        where: {
          slug: product.category,
        },
      });
      const sampleImage = product.image
        ? await prisma.image.findUnique({
            where: {
              original: product.image,
            },
          })
        : undefined;
      const sampleGif = product.gif
        ? await prisma.gif.findFirst({
            where: {
              original: product.gif,
            },
          })
        : null;

      let ImageExtra: string[] = [];
      if (product.imageExtra) {
        for (let i = 0; i < product.imageExtra.length; i++) {
          const imageData = await prisma.image.findUnique({
            where: {
              //@ts-ignore
              original: product.imageExtra[i],
            },
          });
          if (imageData) {
            ImageExtra.push(imageData.id);
          }
        }
      }

      await prisma.product.create({
        data: {
          name: product.name,
          brand: "ICB", //product.brand,
          description: product.description,
          shortDescription: product.shortDescription,
          currency: product.currency,
          slug: slug(product.name) + `${Math.floor(Math.random() * 1000)}`,
          SKU: product.SKU,
          barcode: product.barcode,
          stock: product.stock,
          stockWarn: product.stockWarn,
          price: product.price,
          suggestedPrice: Math.round(product.price * 1.1) ?? 0,
          height: product.height,
          width: product.width,
          length: product.length,
          weight: product.weight,
          tags: product.tags,
          model: product.model,
          approval: product.approval,
          attributes: (sampleCategories?.characteristics as Attributes[])?.map(
            (c: Attributes) => {
              const obj: Obj = {
                id: c.id,
                name: c.name,
                value:
                  c.type === "text"
                    ? faker.word.adjective(5)
                    : c.type === "number"
                    ? Math.floor(Math.random() * 10000)
                    : {
                        low: Math.floor(Math.random() * 100),
                        high: Math.floor(Math.random() * 10000),
                      },
                unit: c.unit,
              };
              if (randomValue === 2) {
                obj.value = undefined;
                return obj;
              } else {
                return obj;
              }
            },
          ),
          type: productType[Math.floor(Math.random() * productType.length)]
            ?.name,
          unit: productUnit[Math.floor(Math.random() * productUnit.length)]
            ?.name,
          imageId:
            sampleImage?.id ||
            (allImages[Math.floor(Math.random() * allImages.length)] as Image)
              .id,
          brochureId: allPdf[0]?.id,
          manualId: allPdf[1]?.id,
          // gifId: (allGifs[Math.floor(Math.random() * allGifs.length)] as Gif)
          //   .id,
          gifId: sampleGif?.id,
          complements: {},
          complementOf: {},
          relations: {},
          relationOf: {},
          producer: {
            create: {
              producer: {
                connect: {
                  id: producer(Math.floor(Math.random() * 15)),
                },
              },
            },
          },
          ImagesExtra:
            ImageExtra.length > 0
              ? {
                  create: ImageExtra?.map((extra: string) => ({
                    orden: ImageExtra?.length,
                    image: {
                      connect: {
                        id: extra,
                      },
                    },
                  })),
                }
              : undefined,
          Category: sampleCategories?.id
            ? {
                connect: {
                  id: sampleCategories?.id,
                },
              }
            : undefined,
          seo: {
            create: {},
          },
          ProductHistory: {
            create: [
              {
                type: "create",
                date: faker.date.between(
                  "2020-01-01T00:00:00.000Z",
                  "2023-01-01T00:00:00.000Z",
                ),
                user: {
                  connect: {
                    id: users(Math.floor(Math.random() * 10))?.id,
                  },
                },
              },
              {
                type: "edit",
                date: faker.date.between(
                  "2020-01-01T00:00:00.000Z",
                  "2023-01-01T00:00:00.000Z",
                ),
                user: {
                  connect: {
                    id: users(Math.floor(Math.random() * 10))?.id,
                  },
                },
              },
              {
                type:
                  Math.floor(Math.random() * 2) + 1 === 1
                    ? "approve"
                    : "disapprove",
                date: faker.date.between(
                  "2020-01-01T00:00:00.000Z",
                  "2023-01-01T00:00:00.000Z",
                ),
                user: {
                  connect: {
                    id: users(Math.floor(Math.random() * 10))?.id,
                  },
                },
              },
            ],
          },
        },
      });
      console.log("generating product");
    }

    const products = await prisma.product.findMany({});
    const productos = products.map((p) => p.id);
    for (const product of products) {
      const ranNum = Math.floor(Math.random() * 2);
      const idArray = getRandomInt(productos, ranNum);
      const idArray2 = getRandomInt(productos, ranNum);
      const { id } = product;
      const randomChoose = Math.floor(Math.random() * 5);

      const myProduct = await prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          producer: true,
        },
      });
      if (randomChoose === 1) {
        await prisma.product.update({
          where: { id },
          data: {
            // producer: {
            //   disconnect: myProduct?.producer.map((p) => {
            //     const prueba = {
            //       id: p.id,
            //     };
            //     return prueba;
            //   }),
            // },
            complements: {
              deleteMany: {},
              create: idArray?.map((id) => ({
                complement: {
                  connect: {
                    id: id,
                  },
                },
              })),
            },
            relations: {
              deleteMany: {},
              create: idArray2?.map((id) => ({
                relation: {
                  connect: {
                    id: id,
                  },
                },
              })),
            },
          },
        });
      } else {
        await prisma.product.update({
          where: { id },
          data: {
            complements: {
              deleteMany: {},
              create: idArray?.map((id) => ({
                complement: {
                  connect: {
                    id: id,
                  },
                },
              })),
            },
            relations: {
              deleteMany: {},
              create: idArray2?.map((id) => ({
                relation: {
                  connect: {
                    id: id,
                  },
                },
              })),
            },
          },
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating products");
}
