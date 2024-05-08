import { useEffect, useRef, useState, type ElementRef } from "react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createProducerFormSchema,
  type CreateProducerFormValues,
} from "@acme/api/src/schemas/producerSchema";

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

export default function CreateProducerForm() {
  const utils = trpc.useContext();
  const { mutate: createProducer, isLoading: creadoProducer } =
    trpc.producer.create.useMutation({
      async onSuccess() {
        await utils.producer.all.invalidate();
        reset();
        imageRef.current?.reset();
       void Toast.fire({
          title: "El fabricante ha sido añadido",
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
  const [altImage, setAltImage] = useState<string | null>();
  const [fileName, setFileName] = useState<string>();

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateProducerFormValues>({
    resolver: zodResolver(createProducerFormSchema),
  });

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects logoId and categories to producer.
   *
   * @param {CreateProducerFormValues} data
   * @returns
   */
  async function submitForm(data: CreateProducerFormValues) {
    if (base64Image !== undefined) {
      const imageResponse =
        base64Image &&
        (await imageMutator({
          path: "images/producer/image",
          image: base64Image,
          size,
          alt: altImage,
          name: fileName,
        }));

      if (imageResponse === undefined) {
        setImageError("Algo salió mal mientras se subía la imagen");
        return;
      }
      createProducer({
        ...data,
        logoId: imageResponse ? imageResponse.id : undefined,
        categories: [""],
      });
    } else {
      createProducer({
        ...data,
        categories: [""],
      });
    }
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof CreateProducerFormValues} field
   * @returns
   */
  function getError(field: keyof CreateProducerFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
  }, [base64Image]);
  return (
    <>
      <form autoComplete="off" onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                Fabricante
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Información general del fabricante.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <TextFormElement
                label="Nombre"
                className="-mb-12 sm:col-span-4"
                {...register("name")}
                error={getError("name")}
              />
              <TextFormElement
                label="Página Web"
                className="-mb-12 sm:col-span-3"
                {...register("webSite")}
                error={getError("webSite")}
              />

              <TextFormElement
                label="Ubicación"
                className="-mb-12 sm:col-span-3"
                {...register("location")}
                error={getError("location")}
              />
              <EmailLoopFormElement
                // @ts-expect-error TODO: fix this
                control={control}
                className="-mb-12 sm:col-span-3"
                label="Correos Electrónicos"
                name="emails"
                inputType="email"
                error={getError("emails")}
              />
              <PhoneLoopFormElement
                // @ts-expect-error TODO: fix this
                control={control}
                className="-mb-12 sm:col-span-3"
                label="Teléfonos"
                name="phones"
                error={getError("phones")}
              />

              <div className="col-span-full">
                <ImageFormElement
                  name="Logo"
                  error={imageError}
                  size={size}
                  image={base64Image}
                  setImage={setBase64Image}
                  ref={imageRef}
                  altImage={altImage}
                  setAltImage={setAltImage}
                  setFileName={setFileName}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <LinkElement
            href={`/admin/fabricante`}
            size="sm"
            intent="primary"
            className="mr-2"
          >
            Volver
          </LinkElement>
          {!creadoProducer && !subiendoImg && (
            <ButtonElement type="submit" intent="primary">
              Subir
            </ButtonElement>
          )}
          {(creadoProducer || subiendoImg) && (
            <ButtonElement type="button" disabled intent="primary">
              <Spinner
                classNameDiv="none"
                classNameSVG="w-5 h-5 mr-3 animate-spin"
              />
              Subiendo...
            </ButtonElement>
          )}
        </div>
        <DevTool control={control} />
      </form>
      {/* <form autoComplete="off" onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Nombre"
        {...register("name")}
        error={getError("name")}
      />
      <TextFormElement
        label="Página Web"
        {...register("webSite")}
        error={getError("webSite")}
      />
      <TextFormElement
        label="Ubicación"
        {...register("location")}
        error={getError("location")}
      />
      <EmailLoopFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        label="Correos Electrónicos"
        name="emails"
        inputType="email"
        error={getError("emails")}
      />
      <PhoneLoopFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        label="Teléfonos"
        name="phones"
        error={getError("phones")}
      />
      <ImageFormElement
        name="Logo"
        error={imageError}
        size={size}
        image={base64Image}
        setImage={setBase64Image}
        ref={imageRef}
        altImage={altImage}
        setAltImage={setAltImage}
        setFileName={setFileName}
      />
      <LinkElement
        href={`/admin/fabricante`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoProducer && !subiendoImg && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {(creadoProducer || subiendoImg) && (
        <ButtonElement type="button" disabled intent="primary">
          <Spinner
            classNameDiv="none"
            classNameSVG="w-5 h-5 mr-3 animate-spin"
          />
          Subiendo...
        </ButtonElement>
      )}
      <DevTool control={control} />
    </form> */}
    </>
  );
}
