import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import bcrypt from 'bcrypt';
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { PrismaClient } from "@acme/db";
import { api } from "~/utils/api";


const prisma = new PrismaClient();

export default {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {

      if (account) {
        token.accessToken = account?.access_token;
        token.id = user.id;
        // token.refreshToken = account?.refresh_token;
        // token.idToken = account?.id_token;
        // token.expiresIn = account?.expires_in;
      }
      return token
    },
    signIn: async ({ account, user, credentials, profile }) => {

      if (account) {
        const findUser = await prisma.user.findFirst({
          where: {
            email: (profile?.email || user?.email) as string,
          },
          include: {
            accounts: true,
          },
        });
        const condition = (findUser?.accounts?.length || 0) >= 0 ? true : false;
        try {
          condition &&
            (await prisma.user.update({
              where: { email: (profile?.email || user?.email) as string },
              data: {
                name: (profile.name || user.name),
                image: profile?.picture || profile?.image_url,
                accounts: {
                  connectOrCreate: [
                    {
                      where: {
                        provider: account?.provider,
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
            }));
        } catch (error) {
          //q:remember, we like waaaaaaaaaaaaaaaaaaaaaaa
          //a:yes, we do
          console.log(error, 'waaaaaaaaaaaaaaaaaaaaaaaa');


        }
        return true;
      }
    },

    account: (user: any) => {
      return {
        ...user,
        isGood: Math.random() >= 0.5,
      };
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    // @ts-ignore
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      async authorize(credentials, req) {
        // try {
        const { username, password } = credentials;
        const user = await prisma.user.findUnique({
          where: {
            email: username as string,
          },
          include: {
            accounts: true,
          },
        });
        return user
        // } catch (error) {
        //   throw new Error("Usuario no encontrado")
        // }
      }
    })
  ],
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
};
