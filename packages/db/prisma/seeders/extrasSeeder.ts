import { PrismaClient } from "@prisma/client";

import { productType, productUnit } from "./../data/productData";

const prisma = new PrismaClient();

export async function generateUnits() {
  try {
    for (const unit of productUnit) {
      await prisma.productUnit.upsert({
        where: { name: unit.name },
        update: {},
        create: {
          name: unit.name,
        },
      });
      console.log("generating unit");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating unit");
}

export async function generateTypes() {
  try {
    for (const type of productType) {
      await prisma.productType.upsert({
        where: { name: type.name },
        update: {},
        create: {
          name: type.name,
        },
      });
    }
    console.log("generating type");
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating type");
}
