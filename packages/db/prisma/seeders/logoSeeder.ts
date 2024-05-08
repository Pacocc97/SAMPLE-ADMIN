import { PrismaClient } from "@prisma/client";

import { logoImages } from "../data/logoData";

const prisma = new PrismaClient();

export async function generateLogos() {
  try {
    for (const logo of logoImages) {
      await prisma.image.create({
        data: {
          path: logo.path,
          original: logo.original,
          webp: logo.webp,
          blur: logo.blur,
          width: logo.width || 1,
          height: logo.height || 1,
        },
      });
      console.log("generating logo");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating logo");
}
