import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  createUserFormSchema,
  type CreateUserFormValues,
} from "@acme/api/src/schemas/userSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/trpc";
import ButtonElement from "~/components/ui/ButtonElement";

export default function SignupForm() {
  const router = useRouter();
  const utils = trpc.useContext();
  const { callbackUrl } = router.query;

  const { mutate: createClient } = trpc.users.register.useMutation({
    async onSuccess(data, variables) {
      console.log(data, "data");
      console.log(variables, "variables");

      await utils.users.all.invalidate();
      void Toast.fire({
        title: "Cuenta creada con éxito",
        icon: "success",
      });

      signIn("credentials", {
        email: variables.email,
        password: variables.password,
        callbackUrl: callbackUrl?.toString() || "/",
        redirect: false,
      })
        .then(async (value) => {
          if (value?.status === 200) {
            await router.push(value.url as string);
          } else {
            console.log(value);

            alert(value?.error);
          }
        })
        .catch((error) => alert(error.error));
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
  });

  const submitForm = (data: CreateUserFormValues) => {
    createClient({ ...data });
  };

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateUserFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof CreateUserFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submitForm)}>
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
            type="email"
            autoComplete="email"
            required
            {...register("email", {
              required: "Este campo es obligatorio",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Dirección de correo electrónico inválida",
              },
            })}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
          {getError("email") && (
            <span className="text-red-500">{getError("email")}</span>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre
        </label>
        <div className="mt-1">
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            {...register("name", {
              required: "Este campo es obligatorio",
            })}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
          {getError("name") && (
            <span className="text-red-500">{getError("name")}</span>
          )}
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
            type="password"
            autoComplete="current-password"
            required
            {...register("password", {
              required: "Este campo es obligatorio",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            })}
            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
          {getError("password") && (
            <span className="text-red-500">{getError("password")}</span>
          )}
        </div>
      </div>

      {/* <div className="flex items-center justify-between">
        <div className="flex items-center">
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
            Recuérdame
          </label>
        </div>
      </div> */}

      <div>
        <ButtonElement type="submit" intent="primary" fullWidth size="sm">
          Registrarse
        </ButtonElement>
      </div>
      {/* <DevTool control={control} /> */}
    </form>
  );
}
