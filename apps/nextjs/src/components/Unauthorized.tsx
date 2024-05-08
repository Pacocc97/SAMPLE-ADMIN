import Link from "next/link";
import { useSession } from "next-auth/react";

type Props = {
  permission: string;
};

export default function Unauthorized({ permission }: Props) {
  const { data } = useSession();

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <h1 className="text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500 lg:text-9xl">
        No Autorizado
      </h1>
      <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
        No tiene permiso para {permission.replaceAll("_", " ")}.
      </p>
      <Link
        href="/"
        className="my-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
      >
        Volver a página principal
      </Link>
    </section>
  );
}
