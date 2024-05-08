import { PrismaClient } from "@prisma/client";

import { serverPdf } from "../data/pdfData";

const prisma = new PrismaClient();

export async function generatePdfs() {
  await prisma.pdf.deleteMany({});
  try {
    for (const pdf of serverPdf) {
      await prisma.pdf.create({
        data: {
          path: pdf.path,
          original: pdf.original,
        },
      });
      console.log("generating pdf");
    }
  } catch (e) {
    console.error(e);
  }
  console.log("finished generating pdf");
}
