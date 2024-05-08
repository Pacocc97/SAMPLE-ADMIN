import slug from "slug";

import { prisma } from "@acme/db/index";

type Model =
  | "product"
  | "producer"
  | "category"
  | "package"
  | "blog"
  | "categoryBlog";

export async function slugify(str: string, model: Model): Promise<string> {
  const newSlug = slug(str);

  let existing;

  switch (model) {
    case "product":
      existing = await prisma.product.findUnique({
        where: { slug: newSlug },
      });
      break;

    case "package":
      existing = await prisma.productPackage.findUnique({
        where: { slug: newSlug },
      });
      break;

    case "producer":
      existing = await prisma.producer.findUnique({
        where: { slug: newSlug },
      });
      break;

    case "category":
      existing = await prisma.category.findUnique({
        where: { slug: newSlug },
      });
      break;

    case "blog":
      existing = await prisma.blog.findUnique({
        where: { slug: newSlug },
      });
      break;

    case "categoryBlog":
      existing = await prisma.blog.findUnique({
        where: { slug: newSlug },
      });
      break;

    default:
      break;
  }

  if (existing) {
    return slugify(`${str}-${Math.floor(Math.random() * 100)}`, model);
  }

  return newSlug;
}
