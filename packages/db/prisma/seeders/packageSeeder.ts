import { faker } from "@faker-js/faker";
import { PrismaClient, Product, type Image } from "@prisma/client";
import slug from "slug";

import { packageDesc, servePack } from "../data/packageData";

const prisma = new PrismaClient();

type Package = {
  name: string;
  price: number;
  products?: string[];
  description: string;
  shortDescription: string;
};

export function packageSeeder() {
  const packages: Package[] = [];

  const dataString = JSON.stringify(packageDesc);

  for (let i = 0; i < servePack.length; i++) {
    // console.log(servePack[i].products, "servePack[i].products");

    const productPackage: Package = {
      name: servePack?.[i]?.name as string,
      price: Math.floor(Math.random() * 9999999 - 100) + 100,
      products: servePack?.[i]?.products,
      description: dataString,
      shortDescription: faker.commerce.productDescription(),
    };

    packages.push(productPackage);
  }

  return packages;
}

export async function generatePackages() {
  const allImages = await prisma.image.findMany({
    where: { path: "demo/images/product/image" },
  });
  const allProducts = await prisma.product.findMany({});

  await prisma.productPackage.deleteMany({});
  const productId = allProducts.map((p) => p.id);

  // const productData = Array.from({ length: 5 }, () => productId);

  function productData(arr: string[], num: number) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, num);
  }

  try {
    for (const pack of packageSeeder()) {
      let packProducts: Product[] = [];
      if (pack.products) {
        for (let i = 0; i < pack.products.length; i++) {
          const productData = await prisma.product.findFirst({
            where: {
              //@ts-ignore
              SKU: pack.products[i],
            },
          });
          if (productData) {
            packProducts.push(productData);
          }
        }
      }

      await prisma.productPackage.create({
        data: {
          name: pack.name,
          slug: slug(pack.name),
          price: packProducts
            ?.map((p) => p.price)
            .reduce((accumulator, value) => {
              return accumulator + value;
            }, 0),
          description: pack.description,
          shortDescription: pack.shortDescription,
          image: {
            connect: {
              id: packProducts?.[0]?.imageId,
              // id: (
              //   allImages[Math.floor(Math.random() * allImages.length)] as Image
              // ).id,
            },
          },
          // products: {
          //   connect: productData(productId, 5)?.map((product: string) => ({
          //     id: product,
          //   })),
          // },
          products: {
            connect: packProducts?.map((product: Product) => ({
              id: product.id,
            })),
          },
          seo: {
            create: {},
          },
        },
      });
      console.log("creating package");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating package");
}
