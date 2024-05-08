import { TRPCError } from "@trpc/server";
import sizeOf from "image-size";
import { nanoid } from "nanoid";
import fetch from 'node-fetch';
import { deleteFile, uploadFile } from "../lib/s3";
import {
  findById,
  findByOriginal,
  findBySrc,
  findImageById,
} from "../schemas/generalSchema";
import {
  createImageFromBase64Schema,
  updateImageSchema,
} from "../schemas/imageSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import {
  bufferToStream,
  convertImage,
  encodeImageToBlurhash,
  resizeImage,
} from "../utils/image";

export const imageRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.image.findMany();
  }),

  // showUrl
  showUrl: publicProcedure
    .input(findByOriginal)
    .mutation(async ({ input, ctx }) => {
      const { original } = input;
      try {
        const image = await ctx.prisma.image.findFirst({ where: { original } });

        const response = await fetch(
          `${process.env.SERVER_URL}/_next/image?url=https://d26xfdx1w8q2y3.cloudfront.net/${image?.path}/${image?.original}&w=384&q=75`,
        );

        // return base64Image;
        // Convert the image data to a buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert the buffer to a base64 string
        const base64Image = buffer.toString('base64');



        return base64Image;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // show
  show: publicProcedure.input(findById).query(({ input, ctx }) => {
    const { id } = input;
    try {
      return ctx.prisma.image.findUnique({ where: { id } });
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // show
  showOriginal: publicProcedure
    .input(findByOriginal)
    .query(({ input, ctx }) => {
      const { original } = input;
      try {
        return ctx.prisma.image.findFirst({ where: { original } });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // create
  create: protectedProcedure
    .input(createImageFromBase64Schema)
    .mutation(async ({ input, ctx }) => {
      try {
        // verify that image is a base64 string with regex
        if (!input.image.match(/data:image\/(png|jpeg|jpg);base64,/)) {
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
        const ext =
          input.name?.split(".")[1] || input.image.split(";")[0]?.split("/")[1];
        const stream = bufferToStream(file);
        const output = await convertImage(stream, "webp");
        const name = input.name?.split(".")[0] || nanoid(12);
        const blur = await encodeImageToBlurhash(file);
        const { width, height } = sizeOf(file);
        const existingImage = await ctx.prisma.image.findUnique({
          where: { original: `${name}.${ext}` },
        });
        if (ext && !existingImage) {
          await Promise.all([
            uploadFile({
              type: `image/${ext}`,
              name: `${input.path}/${name}.${ext}`,
              file: file,
            }),

            uploadFile({
              type: "image/webp",
              name: `${input.path}/${name}.webp`,
              file: output,
            }),
          ]);

          const image = await ctx.prisma.image.create({
            data: {
              path: input.path,
              original: `${name}.${ext}`,
              webp: `${name}.webp`,
              blur: blur,
              width: width || 1,
              height: height || 1,
              alt: input.alt,
            },
          });

          return image;
        } else {
          return existingImage;
        }
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // update
  update: protectedProcedure
    .input(updateImageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, alt } = input;
        return ctx.prisma.image.update({
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
    .input(findImageById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { path } = input;
      const { original } = input;
      const { webp } = input;
      try {
        await Promise.all([
          deleteFile({
            name: `${path}/${original}`,
          }),
          deleteFile({
            name: `${path}/${webp}`,
          }),
        ]);
        await ctx.prisma.image.delete({
          where: { id },
        });
        return {
          id,
        };
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  deleteEditor: protectedProcedure
    .input(findBySrc)
    .mutation(async ({ input, ctx }) => {
      const { src } = input;
      const path = "images/editor";
      const original = src.split("/").pop();
      const webp = original?.split(".")[0] + ".webp";
      try {
        await Promise.all([
          deleteFile({
            name: `${path}/${original}`,
          }),
          deleteFile({
            name: `${path}/${webp}`,
          }),
        ]);
        await ctx.prisma.image.delete({
          where: { original },
        });
        return {
          original,
        };
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
