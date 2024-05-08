import { useEffect, useRef, useState, type ElementRef } from "react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createUserFormSchema,
  type CreateUserFormValues,
} from "@acme/api/src/schemas/userSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import EmailLoopFormElement from "../elements/EmailLoopFormElement";
import ImageFormElement from "../elements/ImageFormElement";
import PhoneLoopFormElement from "../elements/PhoneLoopFormElement";
import SelectFormElement from "../elements/SelectFormElement";

export default function CreateClientForm() {
  const utils = trpc.useContext();
  const roleData = trpc.roles.all.useQuery();
  const role = roleData.data
    ?.filter((r) => r.type === "client")
    .map((role) => ({
      id: role.id,
      name: role.name + `: ${formatAsPercentage(role.discount)} de descuento`,
    }));
  const { mutate: createClient, isLoading: creadoClient } =
    trpc.users.create.useMutation({
      async onSuccess() {
        await utils.users.all.invalidate();
        void Toast.fire({
          title: "El cliente ha sido creado",
          icon: "success",
        });
      },
      async onError(e) {
        await Toast.fire({
          title: e.message,
          icon: "error",
        });
      },
    });

  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();

  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
  });

  /**
   * When form is submitted, creates new client based on passed data.
   *
   * @param {CreateUserFormValues} data
   */
  async function submitForm(data: CreateUserFormValues) {
    if (base64Image !== undefined) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/user/image",
        image: base64Image,
        size,
      name: fileName,           
      }));

    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }
    createClient({ ...data, pictureId: imageResponse ? imageResponse.id : undefined });
  } else {
    createClient({ ...data})}
}

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

  /**
   * Formats passed number as a percentage formatted value.
   *
   * @param {number} num
   * @returns {string} num percetage format as string
   */
  function formatAsPercentage(num: number | null): string {
    if (num) {
      if (num === 0) {
        return "0" + "%";
      }
      return new Intl.NumberFormat("default", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num / 10000);
    } else return "0%";
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
  }, [base64Image]);
  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Nombre"
        {...register("name")}
        error={getError("name")}
      />

      <ImageFormElement
        name="Foto de perfil"
        error={imageError}
        size={size}
        image={base64Image}
        setImage={setBase64Image}
        ref={imageRef}
        setFileName={setFileName}
      />

      <EmailLoopFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        label="Correos Electrónicos"
        name="contactMails"
        inputType="email"
        error={getError("contactMails")}
      />
      <PhoneLoopFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        label="Teléfonos"
        name="contactPhones"
        error={getError("contactPhones")}
      />

      <SelectFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        nombre="Rol"
        name="rol"
        error={getError("rol")}
        data={role}
        canCreate={false}
      />

      <LinkElement
        href={`/admin/clientes`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoClient && !subiendoImg && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {(creadoClient || subiendoImg) && (
        <ButtonElement type="button" disabled intent="primary">
          <Spinner
            classNameDiv="none"
            classNameSVG="w-5 h-5 mr-3 animate-spin"
          />
          Subiendo...
        </ButtonElement>
      )}
      <DevTool control={control} />
    </form>
  );
}
