import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

import { deleteFile, uploadFile } from "../lib/s3";
import { findPdfById } from "../schemas/generalSchema";
import { createPdfFromSchema } from "../schemas/pdfSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";

export const pdfRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.pdf.findMany();
  }),

  // create
  create: publicProcedure
    .input(createPdfFromSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // verify that pdf is a base64 string with regex
        if (!input.pdf.match(/data:application\/pdf;base64,/)) {
          throw new TRPCError({
            message: "Invalid pdf",
            code: "BAD_REQUEST",
            cause: "pdf is not a base64 string",
          });
        }

        const buffer = Buffer.from(
          input.pdf.replace(/^data:application\/\w+;base64,/, ""),
          "base64",
        );
        const file = buffer;

        const ext = input.pdf.split(";")[0]?.split("/")[1];
        const name = input.name?.split(".")[0] || nanoid(12);
        if (ext) {
          await Promise.all([
            uploadFile({
              type: "application/pdf",
              name: `${input.path}/${name}.${ext}`,
              file: file,
            }),
          ]);
          const pdf = await ctx.prisma.pdf.create({
            data: {
              path: input.path,
              original: `${name}.${ext}`,
            },
          });
          return pdf;
        }
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  delete: protectedProcedure
    .input(findPdfById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { path } = input;
      const { original } = input;
      try {
        await Promise.all([
          deleteFile({
            name: `${path}/${original}`,
          }),
        ]);
        await ctx.prisma.pdf.delete({
          where: { id },
        });
        return {
          id,
        };
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
