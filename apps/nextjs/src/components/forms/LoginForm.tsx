import { useState } from "react";
import { useRouter } from "next/router";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";

import ButtonElement from "~/components/ui/ButtonElement";

export default function LoginForm() {
  const [email, setEmail] = useState<string>(""); // Specify the type as string
  const [password, setPassword] = useState<string>(""); // Specify the type as string
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const { callbackUrl } = router.query;

  return (
    <form className="space-y-6" action="#" method="POST">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900"
          >
            Recordar sesión
          </label>
        </div> */}

        {/* <div className="text-sm">
          <a
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </a>
        </div> */}
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              {/* <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div> */}
            </div>
          </div>
        </div>
      )}
      <div>
        {/* <ButtonElement type="submit" intent="primary" fullWidth size="sm">
          Sign in
        </ButtonElement> */}
        <ButtonElement
          type="button"
          onClick={() =>
            signIn("credentials", {
              email,
              password,
              callbackUrl: callbackUrl?.toString() || "/",
              redirect: false,
            })
              .then(async (value) => {
                if (value?.status === 200) {
                  await router.push(value.url as string);
                } else {
                  console.log(value);

                  setError(value?.error);
                }
              })
              .catch((error) => setError((error as Error).message))
          }
          intent="primary"
          fullWidth
          size="sm"
        >
          Ingresar
        </ButtonElement>
      </div>
    </form>
  );
}
