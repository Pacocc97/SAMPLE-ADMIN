/* eslint-disable @typescript-eslint/no-empty-interface */

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma, type Image, type User as PrismaUser } from "@acme/db";
import bcrypt from 'bcrypt';

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      role?: string;
      permissions?: string[];
      pictureId?: string | null;
      picture?: Image | null;
    } & DefaultSession["user"];
  }

  interface User extends PrismaUser { }
}

type MyCredentials = {
  email: string;
  password: string;
};



/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  /**
   * Callbacks are asynchronous functions you can use to control what happens when an action is performed.
   * Callbacks are extremely powerful, especially in scenarios involving JSON Web Tokens as they allow you
   * to implement access controls withouAt a database and to integrate with external databases or APIs.
   *
   * @see https://next-auth.js.org/configuration/callbacks
   */
  callbacks: {
    async signIn({ user, account, profile }) {
      // console.log(user, 'user');
      // console.log(account, 'account');
      // console.log(profile, 'profile');
      if (account) {

        try {
          const findUser = await prisma.user.findFirst({
            where: {
              email: user.email as string,
            },
            include: {
              accounts: true,
            },
          });
          const condition = (findUser?.accounts?.length || 0) >= 0 ? true : false;
          condition &&
            (await prisma.user.update({
              where: { email: user.email as string },
              data: {
                name: profile?.name,
                image: (profile as any)?.picture || (profile as any)?.image_url,
                accounts: {
                  connectOrCreate: [
                    {
                      where: {
                        providerAccountId: account?.providerAccountId,
                      },
                      create: {
                        type: "oidc",
                        provider: account.provider,
                        providerAccountId: account.providerAccountId,
                        access_token: account?.access_token,
                        expires_at: account?.expires_at,
                        token_type: account?.token_type,
                        scope: account?.scope,
                        id_token: account?.id_token,
                      },
                    },
                  ],
                },
              },

            }).then((res) => console.log(res, 'res')));
        } catch (error) {
          console.log(error, 'ERROR');
        }
      } else {
        console.log('no account');
      }


      const isAllowedToSignIn =
        user.disable && user.disable === true ? false : true;
      console.log(isAllowedToSignIn, 'isAllowedToSignIn');

      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        // return false;
        // Or you can return a URL to redirect to:
        return "/unauthorized";
      }
    },

    async session({ session, user, token }) {
      // console.log(session, 'session');
      // console.log(user, 'user');
      // console.log(token, 'token');
      const userInfo = await prisma.user.findFirst({
        where: { id: token.id ?? '' },
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
          picture: true,
        },
      });
      // if (session.user) {
      //   session.user.id = user.id;
      //   session.user.pictureId = user.pictureId;
      //   session.user.picture = userInfo?.picture;
      //   session.user.role = userInfo?.role?.name;
      //   session.user.permissions = userInfo?.role?.permissions.map(
      //     (permission) => permission.permission.name,
      //   );
      // }
      session.user.id = token.id as string;
      session.user.pictureId = user?.pictureId;
      session.user.picture = userInfo?.picture;
      session.user.role = userInfo?.role?.name;
      session.user.permissions = userInfo?.role?.permissions.map(
        (permission) => permission.permission.name,
      );
      return session;
    },
    async jwt({ token, account, user }) {
      // console.log(token, 'token');
      // console.log(account, 'account');
      // console.log(user, 'user');
      if (account) {
        token.accessToken = account?.access_token;
        token.id = user.id;
        // token.refreshToken = account?.refresh_token;
        // token.idToken = account?.id_token;
        // token.expiresIn = account?.expires_in;
      }
      return token
    }

  },

  /**
   * If you would like to persist user / account data.
   * The adapter is responsible for connecting NextAuth.js to your database.
   *
   * @see https://next-auth.js.org/configuration/options#adapter
   * @see https://next-auth.js.org/adapters/prisma
   */
  adapter: PrismaAdapter(prisma),

  /**
   * There are 3 types of providers available:
   *
   * 1. OAuth providers (e.g. Google, Facebook, Twitter, GitHub, etc.)
   * 2. Email providers (e.g. Email Sign In, Magic Links, etc.)
   * 3. Credentials providers (e.g. Ingrese con a username and password, Two-Factor Authentication, etc.)
   *
   * @see https://next-auth.js.org/configuration/providers/oauth
   * @see https://next-auth.js.org/configuration/providers/email
   * @see https://next-auth.js.org/configuration/providers/credentials
   */
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Ingrese con...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const { email, password } = credentials as { email: string, password: string }

        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
          include: {
            accounts: true,
          },
        });

        if (user) {
          // Compare the provided password with the stored hashed password using bcrypt.compare
          if (user.password) {

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
              // Password is valid, return the user object
              return user

            } else {
              throw new Error("Contraseña incorrecta")
            }
          } else {
            // Password is invalid, return null
            throw new Error("Usuario sin contraseña")
          }
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          throw new Error("Usuario no encontrado")

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
  ],
  /**
   * NextAuth.js automatically creates simple, unbranded authentication pages for handling Sign in, Sign out, Email Verification and displaying error messages.
   * The options displayed on the sign-up page are automatically generated based on the providers specified in the options passed to NextAuth.js.
   * To add a custom login page, you can use the pages option:
   *
   * @see https://next-auth.js.org/configuration/pages
   */
  pages: {
    signIn: "/login",
  },
};
