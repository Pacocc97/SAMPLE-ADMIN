import bcrypt from 'bcrypt';
import { createTRPCRouter, publicProcedure } from "../trpc";
import { signinSchema } from '../schemas/authSchema';
import { handleTRPCError } from '../utils/errorHandler';

export const authRouter = createTRPCRouter({
  // signin
  signin: publicProcedure
    .input(signinSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      try {

        const user = await ctx.prisma.user.findUnique({
          where: {
            email: username as string,
          },
          include: {
            accounts: true,
          },
        });
        console.log(user, "user")

        if (user) {
          // Compare the provided password with the stored hashed password using bcrypt.compare
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);


            if (isPasswordValid) {
              // Password is valid, return the user object
              return user

            } else {
              return new Error("Contraseña incorrecta")
            }
          } else {
            // Password is invalid, return null
            return new Error("Usuario sin contraseña")
          }
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return new Error("Usuario no encontrado")

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      } catch (error) {
        handleTRPCError(error)
      }
    }),

  // updatePassword
  updatePassword: publicProcedure
    .input(signinSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      const saltRounds = 10;
      try {

        const hash = await new Promise((resolve, reject) => {
          bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
              console.error('Error generating salt:', err);
              reject(err);
            } else {
              bcrypt.hash(password, salt, (err, hash) => {
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

        await ctx.prisma.user.update({
          where: {
            email: username as string,
          },
          data: {
            password: hash as string,
          },
        });


      } catch (error) {
        handleTRPCError(error)
      }
    }),

});
