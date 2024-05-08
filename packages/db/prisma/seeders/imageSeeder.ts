import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

import { allImages } from "../data/imageData";

const prisma = new PrismaClient();

type Image = {
  path: string;
  original?: string;
  webp?: string;
  blur: string;
  width: number;
  height: number;
};

function imageSeeder() {
  const amountOfImages = allImages.length;
  const images: Image[] = [];
  for (let i = 0; i < amountOfImages; i++) {
    const imageSelect = allImages[i];
    const imageName = imageSelect?.split(".")?.[0];
    const imageExt = imageSelect?.split(".")?.[1];
    const image: Image = {
      path: `demo/images/product/image`,
      original: imageSelect
        ? `${imageName || imageSelect}.${imageExt || "jpg"}`
        : "",
      webp: imageSelect ? `${imageName || imageSelect}.webp` : "",
      blur: "UBCsjt?b0000~qM{9F-:00Rj-;xuM{%MWB9F",
      width: 450,
      height: 476,
    };

    images.push(image);
  }

  return images;
}
export async function generateImages() {
  await prisma.image.deleteMany({});
  try {
    for (const image of imageSeeder()) {
      await prisma.image.create({
        data: {
          path: image.path,
          original: image.original || "",
          webp: image.webp || "",
          blur: image.blur,
          width: image.width || 1,
          height: image.height || 1,
          alt: faker.hacker.phrase(),
        },
      });

      console.log("generating image");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating images");
}
