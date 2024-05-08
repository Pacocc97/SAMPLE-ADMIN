import { type ReactNode } from "react";
import Head from "next/head";

import Header from "./Header";

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>Prisma Starter</title>
        <link rel="icon" href="/images/Logo-ICB-letras.png" />
      </Head>

      <div className="bg-white dark:bg-gray-600">
        <Header />
        <main>{children}</main>
        <footer></footer>
      </div>
    </>
  );
};
