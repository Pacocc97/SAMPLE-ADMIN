import { PrismaClient } from "@prisma/client";

import { serverGif } from "../data/gifData";

const prisma = new PrismaClient();

export async function generateGifs() {
  await prisma.gif.deleteMany({});
  try {
    for (const gif of serverGif) {
      await prisma.gif.create({
        data: {
          path: gif.path,
          original: gif.original,
          width: gif.width || 1,
          height: gif.height || 1,
        },
      });
      console.log("Generating gif");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating gif");
}
