import { faker } from "@faker-js/faker";
import { PrismaClient, type Role, type User } from "@prisma/client";

const prisma = new PrismaClient();

type MyUser = {
  name: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  createdAt?: Date | string;
};

export function userSeeder() {
  const amountOfUsers = 25;
  const users: MyUser[] = [];

  for (let i = 0; i < amountOfUsers; i++) {
    const user: MyUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      emailVerified: undefined,
      image: faker.image.avatar(),
      createdAt: faker.date.between(
        "2020-01-01T00:00:00.000Z",
        "2023-01-01T00:00:00.000Z",
      ),
    };

    users.push(user);
  }

  return users;
}

export async function generateUsers() {
  // await prisma.user.deleteMany({
  //   where: {
  //     email: {
  //       not: "pacocc97@gmail.com",
  //     },
  //   },
  // });
  const allRoles: Role[] = await prisma.role.findMany({});
  try {
    for (const user of userSeeder()) {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          disable: false,
          createdAt: user.createdAt,
          role: {
            connect: {
              id: (
                allRoles[Math.floor(Math.random() * allRoles.length)] as Role
              ).id,
            },
          },
        },
      });
    }
    console.log("generating user");
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating users");
}

export async function generateComments() {
  await prisma.userComment.deleteMany({});
  const allUsers: User[] = await prisma.user.findMany({});
  const commentingUser = await prisma.user.findMany({
    where: {
      role: {
        type: "team",
      },
    },
  });

  function getRandomInt(arr: string[], num: number) {
    if (num === 0) {
      return undefined;
    } else {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
    }
  }
  for (const user of allUsers) {
    try {
      const ranNum = Math.floor(Math.random() * 15);
      const idArray = getRandomInt(
        commentingUser.map((com) => com.id),
        ranNum,
      );
      const { id } = user;
      await prisma.user.update({
        where: { id },
        data: {
          userCommenting: {
            create: idArray?.map((id) => ({
              createdAt: faker.date.between(
                "2022-01-01T00:00:00.000Z",
                "2023-01-01T00:00:00.000Z",
              ),
              comment: faker.lorem.paragraph(),
              userCommented: {
                connect: {
                  id: id,
                },
              },
            })),
          },
        },
      });
      console.log("generating comments");
    } catch (e) {
      console.error(e);
    }
    console.log("finished generating comments");
  }
}

export async function updateUser() {
  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" },
  });
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: {
          connect: {
            id: adminRole?.id,
          },
        },
      },
    });
  }
  console.log("updated user");
}
