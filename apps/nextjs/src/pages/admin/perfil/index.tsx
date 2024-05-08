import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MutableRefObject,
  type ReactElement,
} from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Image as Imagen } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from "@acme/api/src/schemas/userSchema";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import { AdminLayout } from "~/components/layouts/AdminLayout";
import ButtonElement from "~/components/ui/ButtonElement";
import { env } from "~/env.mjs";

export default function Page() {
  const utils = trpc.useContext();
  const router = useRouter();
  const { data } = useSession();
  const [base64Image, setBase64Image] = useState<string>();
  const [image, setImage] = useState<string>();
  const [imageError, setImageError] = useState<string | undefined>(undefined);

  const user = data?.user;
  const userFirstName = user?.name?.split(" ")[0];
  const userLastName = user?.name?.slice(user?.name?.indexOf(" ") + 1);
  const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const userPicture = `${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
    user?.picture ? user?.picture.path : ""
  }/${user?.picture ? user?.picture.original : ""}`;

  const { mutate: updateUser } = trpc.users.change.useMutation({
    async onSuccess() {
      await utils.users.all.invalidate();
      await Toast.fire({
        title: "El usuario ha sido actualizado!",
        icon: "success",
      });
      router.reload();
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });
  const { mutateAsync: imageMutator } = trpc.image.create.useMutation();
  const { mutate: deleteImg } = trpc.image.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La imagen ha sido borrada!",
        icon: "success",
      });
      router.reload();
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   */
  async function deletePictureHandler(image: Imagen | undefined | null) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
      text: "Se borrará la foto!",
    }).then((result) => {
      if (result.isConfirmed && image) {
        deleteImg({
          id: image.id,
          path: image.path,
          original: image.original,
          webp: image.webp,
        });
      }
    });
  }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: {
      userFirstName: userFirstName,
      userLastName: userLastName,
    },
  });

  const size = {
    height: 100,
    width: 100,
  };

  /**
   * When form is submitted, updates categoría based on passed data.
   *
   * @param {CreateUserFormValues} data
   */
  async function submitForm(data: UpdateProfileFormValues) {
    const imageResponse =
      image &&
      (await imageMutator({
        path: "images/profile/image",
        image: image,
        size,
      }));

    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      user &&
        user.id &&
        updateUser({
          id: user.id,
          ...data,
        });
    } else {
      if (user?.picture) {
        deleteImg({
          id: user.picture.id,
          path: user.picture.path,
          original: user.picture.original,
          webp: user.picture.webp,
        });
      }
      user &&
        user.id &&
        updateUser({
          id: user.id,
          pictureId: imageResponse && imageResponse.id,
          ...data,
        });
    }
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateUserFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof UpdateProfileFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      setBase64Image(URL.createObjectURL(event.target.files[0]));
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        // The file's text will be printed here
        if (event.target && typeof event.target.result === "string") {
          setImage(`${event.target.result}`);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
  }, [base64Image]);
  return (
    <div>
      <div className="divide-y dark:divide-white/5">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 dark:text-white">
              Información personal
            </h2>
            <p className="mt-1 text-sm leading-6 dark:text-gray-400">
              Información general del perfil de usuario.
            </p>
          </div>

          <form onSubmit={handleSubmit(submitForm)} className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                {user?.image && (
                  <Image
                    src={
                      base64Image
                        ? base64Image
                        : user.pictureId
                        ? userPicture
                        : user.image
                    }
                    alt=""
                    className="h-24 w-24 flex-none rounded-lg object-cover dark:bg-gray-800"
                    height={100}
                    width={100}
                  />
                )}
                <>
                  <div>
                    <input
                      id="pictureId"
                      name="pictureId"
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="pictureId">
                      <a className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 hover:bg-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-gray-600">
                        Cambiar foto
                      </a>
                    </label>
                    {user && user.picture && (
                      <button
                        type="button"
                        onClick={() => deletePictureHandler(user.picture)}
                        className="ml-4 cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 hover:bg-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-gray-600"
                      >
                        Quitar foto
                      </button>
                    )}
                    <p className="mt-2 text-xs leading-5 dark:text-gray-400">
                      JPG o PNG.
                      {/* 1MB max. */}
                    </p>
                  </div>
                </>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 dark:text-white"
                >
                  Nombre
                </label>
                <div className="mt-2">
                  <input
                    id="userFirstName"
                    type="text"
                    {...register("userFirstName")}
                    className={classNames(
                      getError("userFirstName") ? "border-red-500" : "border-0",
                      "block w-full rounded-md py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6",
                    )}
                  />
                </div>
                {getError("userFirstName") && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {getError("userFirstName")}
                  </p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 dark:text-white"
                >
                  Apellidos
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="userLastName"
                    {...register("userLastName")}
                    autoComplete="userLastName"
                    defaultValue={userLastName}
                    className={classNames(
                      getError("userLastName") ? "border-red-500" : "border-0",
                      "block w-full rounded-md py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6",
                    )}
                  />
                </div>
                {getError("userLastName") && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {getError("userLastName")}
                  </p>
                )}
              </div>

              {/* <div className="col-span-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 dark:text-white"
                >
                  Dirección de Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={classNames(
                      getError('email') ? 'border-red-500' : 'border-0',
                      'block w-full rounded-md py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6',
                    )}
                  />
                </div>
                {getError('email') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {getError('email')}
                  </p>
                )}
              </div> */}

              {/* <div className="col-span-full">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Username
                </label>
                <div className="mt-2">
                <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                    <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">
                      example.com/
                    </span>
                    <input
                    type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="janesmith"
                    />
                  </div>
                </div>
              </div> */}
              {/* 
              <div className="col-span-full">
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Timezone
                  </label>
                <div className="mt-2">
                  <select
                    id="timezone"
                    name="timezone"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    >
                    <option>Pacific Standard Time</option>
                    <option>Eastern Standard Time</option>
                    <option>Greenwich Mean Time</option>
                  </select>
                  </div>
              </div> */}
            </div>

            <div className="mt-8 flex">
              <ButtonElement type="submit">Guardar</ButtonElement>
            </div>
            <DevTool control={control} />
          </form>
        </div>

        {/* <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
          <h2 className="text-base font-semibold leading-7 text-white">
              Change password
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Update your password associated with your account.
            </p>
            </div>
            
            <form className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Current password
                </label>
                <div className="mt-2">
                  <input
                    id="current-password"
                    name="current_password"
                    type="password"
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    </div>
              </div>

              <div className="col-span-full">
              <label
                  htmlFor="new-password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                New password
                </label>
                <div className="mt-2">
                  <input
                    id="new-password"
                    name="new_password"
                    type="password"
                    autoComplete="new-password"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                Confirm password
                </label>
                <div className="mt-2">
                  <input
                    id="confirm-password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                </div>
              </div>
              </div>
              
              <div className="mt-8 flex">
              <button
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
              Save
              </button>
              </div>
              </form>
            </div> */}

        {/* <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
            Log out other sessions
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
            Please enter your password to confirm you would like to log out of
            your other sessions across all of your devices.
            </p>
            </div>
            
            <form className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <div className="col-span-full">
                <label
                  htmlFor="logout-password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                Your password
                </label>
                <div className="mt-2">
                <input
                id="logout-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
                </div>
                </div>
                </div>

                <div className="mt-8 flex">
              <button
                type="submit"
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                Log out other sessions
                </button>
                </div>
                </form>
              </div> */}

        {/* <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
          <h2 className="text-base font-semibold leading-7 text-white">
              Delete account
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
              No longer want to use our service? You can delete your account
              here. This action is not reversible. All information related to
              this account will be deleted permanently.
              </p>
          </div>
          
          <form className="flex items-start md:col-span-2">
          <button
          type="submit"
          className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
          >
              Yes, delete my account
              </button>
              </form>
            </div> */}
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
