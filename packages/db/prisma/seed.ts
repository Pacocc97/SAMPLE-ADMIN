/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from "@prisma/client";

import { generateBlogs } from "./seeders/blogSeeder";
import {
  generateBlogCategories,
  generateBlogSubCategories,
} from "./seeders/categoryBlogSeeder";
import {
  generateCategories,
  generateSubCategories,
} from "./seeders/categorySeeder";
import { generateTypes, generateUnits } from "./seeders/extrasSeeder";
import { generateGifs } from "./seeders/gifSeeder";
import { generateImages } from "./seeders/imageSeeder";
import { generateLogos } from "./seeders/logoSeeder";
import { generatePackages } from "./seeders/packageSeeder";
import { generatePdfs } from "./seeders/pdfSeeder";
import { generatePermissions } from "./seeders/permissionsSeeder";
import { generateProducers } from "./seeders/producerSeeder";
import { generateProducts } from "./seeders/productSeeder";
import { generateRoles, updateRole } from "./seeders/rolesSeeder";
import {
  generateComments,
  generateUsers,
  updateUser,
} from "./seeders/userSeeder";

const prisma = new PrismaClient();

async function main() {
  /**
   * This functions are required for the system.
   *
   */
  await generatePermissions();
  await generateRoles();
  await prisma.rolePermissions.deleteMany({});
  await updateRole();
  await updateUser();
  // /**
  //  * This functions are simulated data.
  //  *
  //  */
  await generateImages();
  await generateLogos();
  await generateGifs();
  await generatePdfs();
  await generateBlogs();
  await generateUnits();
  await generateTypes();
  await generateBlogCategories();
  await generateCategories();
  await generateProducers();
  await generateUsers();
  await generateComments();
  await generateBlogSubCategories();
  await generateSubCategories();
  await generateProducts();
  await generatePackages();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
