import { createCommentSchema } from "../schemas/commentSchema";
import { findById, findUser } from "../schemas/generalSchema";
import {
  createUserSchema,
  disableUserSchema,
  partialDeleteUserSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../schemas/userSchema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { handleTRPCError } from "../utils/errorHandler";
import bcrypt from "bcrypt";

export const usersRouter = createTRPCRouter({
  // all
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: {
        role: true,
        picture: true,
        address: true,
      },
    });
  }),

  // create
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { rol, contactMails, pictureId, contactPhones, ...data } = input;
      try {
        return await ctx.prisma.user.create({
          data: {
            ...data,
            contactMails: contactMails || [],
            contactPhones: contactPhones || [],
            role: {
              connect: {
                id: rol ?? undefined,
              },
            },
            picture: pictureId
              ? {
                connect: {
                  id: pictureId,
                },
              }
              : undefined,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // register
  register: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const roleType = await ctx.prisma.role.findUnique({
        where: { name: 'usuario' }
      });

      const { rol, contactMails, pictureId, contactPhones, password: plainPassword, ...data } = input;
      const saltRounds = 10;

      try {
        const hash: string = await new Promise((resolve, reject) => {
          bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
              console.error('Error generating salt:', err);
              reject(err);
            } else {
              bcrypt.hash(plainPassword, salt, (err, hash) => {
                if (err) {
                  console.error('Error hashing password:', err);
                  reject(err);
                } else {
                  resolve(hash);
                }
              });
            }
          });
        });

        return await ctx.prisma.user.create({
          data: {
            ...data,
            password: hash,
            contactMails: [],
            contactPhones: [],
            role: {
              connect: {
                id: roleType?.id,
              },
            },
            picture: undefined,
          },
        });
      } catch (error) {
        // Properly throw and return the error to the front end
        handleTRPCError(error); // Adjust the error handling based on your needs
      }
    }),

  // register: publicProcedure
  //   .input(createUserSchema)
  //   .mutation(async ({ input, ctx }) => {
  //     const roleType = await ctx.prisma.role.findUnique({
  //       where: { name: 'usuario' }
  //     })
  //     const { rol, contactMails, pictureId, contactPhones, password: plainPassword, ...data } = input;
  //     const saltRounds = 10;
  //     return bcrypt.genSalt(saltRounds, (err, salt) => {
  //       if (err) {
  //         console.error('Error generating salt:', err);
  //         return null;
  //       }

  //       // Use the salt to hash the password
  //       return bcrypt.hash(plainPassword, salt, async (err, hash) => {

  //         if (err) {
  //           console.error('Error hashing password:', err);
  //           return null;
  //         }

  //         try {

  //           return await ctx.prisma.user.create({
  //             data: {
  //               ...data,
  //               password: hash,
  //               contactMails: [],
  //               contactPhones: [],
  //               role: {
  //                 connect: {
  //                   id: roleType?.id,
  //                 },
  //               },
  //               picture: undefined,
  //             },
  //           });
  //         } catch (error) {

  //           handleTRPCError(error);
  //         }
  //         // The 'hash' variable now contains the hashed password, which can be stored in the database
  //       });
  //     });

  //   }),

  // show
  show: publicProcedure.input(findUser).query(({ input, ctx }: any) => {
    const { id } = input;
    const { email } = input;
    try {
      if (id) {
        return ctx.prisma.user.findUnique({
          where: { id },
          include: {
            role: true,
            picture: true,
            address: true,
            openPayData: {
              include: {
                order: true,
              },
            },
            userCommenting: {
              include: {
                userCommenting: true,
                userCommented: true,
              },
            },
            userCommented: {
              include: {
                userCommenting: true,
                userCommented: true,
              },
            },
            ProductHistory: {
              include: {
                Product: true,
              },
            },
          },
        });
      } else if (email) {
        return ctx.prisma.user.findUnique({
          where: { email },
          include: {
            role: true,
            address: true,
            openPayData: {
              include: {
                order: {
                  include: {
                    products: {
                      include: {
                        product: {
                          include: {
                            image: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else {
        return null;
      }
    } catch (error) {
      handleTRPCError(error);
    }
  }),

  // change
  change: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, userFirstName, userLastName, ...data } = input;
      try {
        return await ctx.prisma.user.update({
          where: { id },
          data: {
            name: `${userFirstName} ${userLastName}`,
            ...data,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // update
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        rol,
        pictureId,
        userType,
        contactMails,
        contactPhones,
        ...data
      } = input;
      try {
        // if (userType === "client") {
        return await ctx.prisma.user.update({
          where: { id },
          data: {
            ...data,
            contactMails: contactMails || [],
            contactPhones: contactPhones || [],
            role: {
              connect: {
                id: rol ?? '',
              },
            },
            picture: pictureId
              ? {
                connect: {
                  id: pictureId,
                },
              }
              : undefined,
          },
        });
        // } else if (userType === "team") {
        //   return ctx.prisma.user.update({
        //     where: { id },
        //     data: {
        //       ...data,
        //       role: {
        //         connect: {
        //           id: rol,
        //         },
        //       },
        //     },
        //   });
        // } else return;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // disable
  disable: protectedProcedure
    .input(disableUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, disable } = input;
      try {
        return await ctx.prisma.user.update({
          where: { id },
          data: {
            disable: disable,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // delete
  delete: protectedProcedure
    .input(partialDeleteUserSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, deletedAt } = input;

      try {
        return await ctx.prisma.user.update({
          where: { id },
          data: {
            deletedAt: deletedAt,
          },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // comment
  comment: protectedProcedure
    .input(createCommentSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        replyComment,
        comment,
        commenting,
        subComment,
        parentId,
        ...data
      } = input;
      try {
        if (!subComment && comment) {
          return await ctx.prisma.user.update({
            where: { id },
            data: {
              ...data,
              userCommenting: {
                create: {
                  comment: comment,
                  userCommented: {
                    connect: {
                      id: commenting,
                    },
                  },
                },
              },
            },
          });
        } else if (parentId && replyComment) {
          return await ctx.prisma.user.update({
            where: { id },
            data: {
              ...data,
              userCommenting: {
                create: {
                  comment: replyComment,
                  parent: {
                    connect: {
                      id: parentId,
                    },
                  },
                  userCommented: {
                    connect: {
                      id: commenting,
                    },
                  },
                },
              },
            },
          });
        } else {
          return;
        }
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  // deleteComment
  deleteComment: protectedProcedure
    .input(findById)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      try {
        return await ctx.prisma.userComment.delete({
          where: { id },
        });
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});
