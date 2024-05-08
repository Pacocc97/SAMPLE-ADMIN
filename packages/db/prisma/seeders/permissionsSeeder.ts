import { PrismaClient } from "@prisma/client";

import { permissions } from "../data/permissionsData";

const prisma = new PrismaClient();

export async function generatePermissions() {
  try {
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: {
          name: permission.name,
        },
      });
      console.log("generating permission");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished permissions");
}
