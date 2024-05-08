import { faker } from "@faker-js/faker";
import { PrismaClient, type Image } from "@prisma/client";
import slug from "slug";

const prisma = new PrismaClient();

type Producer = {
  name: string;
  emails: string[];
  phones: string[];
  webSite: string;
  location: string;
  categories: string[];
};

export function producerSeeder() {
  const amountOfEmails = 5;
  const emails: string[] = [];
  const amountOfPhones = 5;
  const phones: string[] = [];
  const amountOfProducers = 15;
  const producers: Producer[] = [];

  for (let i = 0; i < amountOfEmails; i++) {
    const email = faker.internet.exampleEmail();
    emails.push(email);
  }

  for (let i = 0; i < amountOfPhones; i++) {
    const phone = faker.phone.number("(##) ####-####");
    phones.push(phone);
  }

  for (let i = 0; i < amountOfProducers; i++) {
    const producer: Producer = {
      name: faker.company.name(),
      emails: emails,
      phones: phones,
      webSite: faker.internet.url(),
      location: faker.address.country(),
      categories: [],
    };

    producers.push(producer);
  }

  return producers;
}

export async function generateProducers() {
  const allLogos = await prisma.image.findMany({
    where: { path: "demo/images/producer/image" },
  });
  await prisma.producer.deleteMany({});
  try {
    for (const producer of producerSeeder()) {
      await prisma.producer.create({
        data: {
          name: producer.name,
          slug: slug(producer.name),
          emails: producer.emails,
          phones: producer.phones,
          webSite: producer.webSite,
          location: producer.location,
          categories: producer.categories,
          logoId: (
            allLogos[Math.floor(Math.random() * allLogos.length)] as Image
          ).id,
        },
      });
      console.log("creating producer");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating producer");
}
