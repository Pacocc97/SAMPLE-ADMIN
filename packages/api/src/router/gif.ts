import { TRPCError } from "@trpc/server";
import sizeOf from "image-size";
import { nanoid } from "nanoid";

import { deleteFile, uploadFile } from "../lib/s3";
import { findGifById } from "../schemas/generalSchema";
import {
  createGifFromBase64Schema,
  updateGifSchema,
} from "../schemas/gifSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import { resizeImage } from "../utils/image";

export const gifRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.gif.findMany();
  }),

  // create
  create: protectedProcedure
    .input(createGifFromBase64Schema)
    .mutation(async ({ input, ctx }) => {
      try {
        // verify that image is a base64 string with regex
        if (!input.image.match(/data:image\/(gif);base64,/)) {
          throw new TRPCError({
            message: "Invalid image",
            code: "BAD_REQUEST",
            cause: "Image is not a base64 string",
          });
        }

        const buffer = Buffer.from(
          input.image.replace(/^data:image\/\w+;base64,/, ""),
          "base64",
        );

        const file =
          input.size && (input.size.width || input.size.height)
            ? await resizeImage(buffer, input.size)
            : buffer;

        const ext = input.name?.split('.')[1] || input.image.split(";")[0]?.split("/")[1];
        const name =  input.name?.split('.')[0] || nanoid(12);
        const { width, height } = sizeOf(file);
        if (ext) {
          await Promise.all([
            uploadFile({
              type: `image/${ext}`,
              name: `${input.path}/${name}.${ext}`,
              file: file,
            }),
          ]);

          const image = await ctx.prisma.gif.create({
            data: {
              path: input.path,
              original: `${name}.${ext}`,
              width: width || 1,
              height: height || 1,
              alt: input.alt,
            },
          });

          return image;
        }
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // update
  update: protectedProcedure
    .input(updateGifSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, alt } = input;
        return ctx.prisma.gif.update({
          where: { id },
          data: {
            alt: alt,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  delete: protectedProcedure
    .input(findGifById)
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
        await ctx.prisma.gif.delete({
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
