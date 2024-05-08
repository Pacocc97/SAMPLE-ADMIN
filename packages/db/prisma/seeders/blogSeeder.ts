import { faker } from "@faker-js/faker";
import { PrismaClient, type Image } from "@prisma/client";
import slug from "slug";

import { myDesc } from "./../data/blogData";

const prisma = new PrismaClient();

type Blog = {
  title: string;
  tags: string[];
  draft: boolean;
  description: string;
  shortDescription: string;
  publishedAt: Date;
};

function generateRandomDate(from: Date, to: Date) {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime()),
  );
}

const dataString = JSON.stringify(myDesc);

export function blogSeeder() {
  const amountOfTags = 7;
  const tags: string[] = [];

  const amountOfBlogs = 15;
  const blogs: Blog[] = [];

  for (let i = 0; i < amountOfTags; i++) {
    const tag = faker.word.noun();
    tags.push(tag);
  }

  for (let i = 0; i < amountOfBlogs; i++) {
    const blog: Blog = {
      title: faker.music.songName(),
      tags: tags,
      draft: faker.datatype.boolean(),
      description: dataString,
      shortDescription: faker.lorem.paragraph(),
      publishedAt: generateRandomDate(
        new Date(2023, 0, 1),
        new Date(2024, 0, 1),
      ),
    };

    blogs.push(blog);
  }

  return blogs;
}

export async function generateBlogs() {
  // const allLogos = await prisma.image.findMany({
  //   where: { path: "demo/images/blog/image" },
  // });
  await prisma.blog.deleteMany({});
  try {
    for (const blog of blogSeeder()) {
      await prisma.blog.create({
        data: {
          title: blog.title,
          slug: `${slug(blog.title)}${Math.floor(Math.random() * 10000)}`,
          tags: blog.tags,
          draft: blog.draft,
          description: blog.description,
          shortDescription: blog.shortDescription,
          seo: {
            create: {},
          },
          publishedAt: blog.publishedAt as Date,
          published: blog.publishedAt < new Date(),
          // logoId: (
          //   allLogos[Math.floor(Math.random() * allLogos.length)] as Image
          // ).id,
        },
      });
      console.log("creating blog");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating blog");
}
