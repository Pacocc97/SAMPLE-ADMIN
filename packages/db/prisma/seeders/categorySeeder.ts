import { faker } from "@faker-js/faker";
import { PrismaClient, type Image, type Prisma } from "@prisma/client";
import slug from "slug";
import { createId } from '@paralleldrive/cuid2';

import {
  serverCategory,
  serverSubAgitadores,
  serverSubCentrifugas,
  serverSubMicropipeta,
  serverSubMicroscopio,
  serverSubPlastico,
} from "../data/categoryData";

const prisma = new PrismaClient();

type Category = {
  name: string;
  description: string;
};

type Characteristics = {
  id: string;
  name: string;
  type: string;
  unit: string;
};

function characteristicSeeder() {
  const amountOfCharacteristics = 3;
  const characteristics: Characteristics[] = [];

  for (let i = 0; i < amountOfCharacteristics; i++) {
    const random = Math.floor(Math.random() * 3);

    const obj = {
      id:  createId(),
      name: faker.word.adjective(5),
      type: random === 1 ? "text" : random === 2 ? "number" : "range",
      unit: faker.science.unit().name,
    };

    characteristics.push(obj);
  }

  return characteristics;
}

export function categorySeeder() {
  const amountOfCategories = serverCategory.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfCategories; i++) {
    const category: Category = {
      name: serverCategory?.[i]?.name || "",
      description: faker.hacker.phrase(),
    };

    categories.push(category);
  }

  return categories;
}

export function subAgitadoresSeeder() {
  const amountOfSubCategories = serverSubAgitadores.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: serverSubAgitadores[i]?.name || "",
      description: faker.lorem.paragraphs(2, "<br/>\n"),
    };

    categories.push(category);
  }

  return categories;
}
export function subCentrifugasSeeder() {
  const amountOfSubCategories = serverSubCentrifugas.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: serverSubCentrifugas[i]?.name || "",
      description: faker.lorem.paragraphs(2, "<br/>\n"),
    };

    categories.push(category);
  }

  return categories;
}
export function subPlasticoSeeder() {
  const amountOfSubCategories = serverSubPlastico.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: serverSubPlastico[i]?.name || "",
      description: faker.lorem.paragraphs(2, "<br/>\n"),
    };

    categories.push(category);
  }

  return categories;
}
export function subMicroscopioSeeder() {
  const amountOfSubCategories = serverSubMicroscopio.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: serverSubMicroscopio[i]?.name || "",
      description: faker.lorem.paragraphs(2, "<br/>\n"),
    };

    categories.push(category);
  }

  return categories;
}
export function subMicropipetasSeeder() {
  const amountOfSubCategories = serverSubMicropipeta.length;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: serverSubMicropipeta[i]?.name || "",
      description: faker.lorem.paragraphs(2, "<br/>\n"),
    };

    categories.push(category);
  }

  return categories;
}

export async function generateCategories() {
  await prisma.category.deleteMany({});
  const allImages = await prisma.image.findMany({
    where: { path: "demo/images/product/image" },
  });
  try {
    for (const category of categorySeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          characteristics: characteristicSeeder() as unknown as
            | Prisma.NullableJsonNullValueInput
            | Prisma.InputJsonValue
            | undefined,
          imageId: (
            allImages[Math.floor(Math.random() * allImages.length)] as Image
          ).id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating category");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating categories");
}

export async function generateSubCategories() {
  const agitador = await prisma.category.findUnique({
    where: {
      slug: "agitadores-mezcladores",
    },
  });
  const centrifuga = await prisma.category.findUnique({
    where: {
      slug: "centrifugas",
    },
  });
  const plastico = await prisma.category.findUnique({
    where: {
      slug: "plastico-de-laboratorio",
    },
  });
  const microscopio = await prisma.category.findUnique({
    where: {
      slug: "microscopios",
    },
  });
  const micropipeta = await prisma.category.findUnique({
    where: {
      slug: "micropipetas",
    },
  });
  try {
    for (const category of subAgitadoresSeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: agitador?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating subcategory");
    }
    for (const category of subCentrifugasSeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: centrifuga?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating subcategory");
    }
    for (const category of subPlasticoSeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: plastico?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating subcategory");
    }
    for (const category of subMicroscopioSeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: microscopio?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating subcategory");
    }
    for (const category of subMicropipetasSeeder()) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: micropipeta?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating subcategory");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating subcategories");
}
