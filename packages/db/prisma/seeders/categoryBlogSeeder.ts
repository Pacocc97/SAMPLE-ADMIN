import { faker } from "@faker-js/faker";
import { PrismaClient, type Image } from "@prisma/client";
import slug from "slug";

const prisma = new PrismaClient();

type Category = {
  name: string;
  description: string;
};
export function categoryBlogSeeder() {
  const amountOfCategories = 10;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfCategories; i++) {
    const category: Category = {
      name: faker.commerce.department(),
      description: faker.hacker.phrase(),
    };

    categories.push(category);
  }

  return categories;
}

export function subCategoryBlogSeeder() {
  const amountOfSubCategories = 5;
  const categories: Category[] = [];

  for (let i = 0; i < amountOfSubCategories; i++) {
    const category: Category = {
      name: faker.commerce.department(),
      description: faker.hacker.phrase(),
    };

    categories.push(category);
  }

  return categories;
}

export async function generateBlogCategories() {
  await prisma.blogCategory.deleteMany({});
  const allImages = await prisma.image.findMany({
    where: { path: "demo/images/product/image" },
  });
  try {
    for (const category of categoryBlogSeeder()) {
      await prisma.blogCategory.create({
        data: {
          name: category.name,
          slug: `${slug(category.name)}${Math.floor(Math.random() * 10000)}`,
          description: category.description,
          imageId: (
            allImages[Math.floor(Math.random() * allImages.length)] as Image
          ).id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating blog category");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating blog categories");
}

export async function generateBlogSubCategories() {
  const all = await prisma.blogCategory.findMany({
    where: { parentId: null },
  });
  try {
    for (const category of subCategoryBlogSeeder()) {
      await prisma.blogCategory.create({
        data: {
          name: category.name,
          slug: slug(category.name),
          description: category.description,
          parentId: all[Math.floor(Math.random() * all.length)]?.id,
          seo: {
            create: {},
          },
        },
      });
      console.log("generating blog subcategory");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating blog subcategories");
}
