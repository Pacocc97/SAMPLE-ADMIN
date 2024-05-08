import { PrismaClient } from "@prisma/client";

import { permissions } from "../data/permissionsData";
import { roles } from "../data/rolesData";

const prisma = new PrismaClient();

export async function generateRoles() {
  await prisma.role.deleteMany({
    where: {
      name: {
        not: "admin",
      },
    },
  }); // Delete this in future
  try {
    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: {
          name: role.name,
          type: role.type,
          discount: role.discount,
          hierarchy: role.hierarchy,
        },
      });
      console.log("generating role");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished roles");
}

export async function updateRole() {
  await prisma.role.update({
    where: { name: "admin" },
    data: {
      permissions: {
        create: permissions.map((permission) => ({
          permission: {
            connect: {
              name: permission.name,
            },
          },
        })),
      },
    },
  });
  console.log("updated role");
}
