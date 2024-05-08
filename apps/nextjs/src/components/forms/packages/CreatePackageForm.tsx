import { useEffect, useRef, useState, type ElementRef } from "react";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createPackageFormSchema,
  type CreatePackageFormValues,
} from "@acme/api/src/schemas/packageSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import ProductsTable from "~/components/ProductsTable";
import Editor from "~/components/editor/Editor";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import PriceFormController from "../elements/PriceFormController";

export default function CreatePackageForm() {
  const utils = trpc.useContext();
  const router = useRouter();
  const { mutate: createPackage, isLoading: creadoPackage } =
    trpc.package.create.useMutation({
      async onSuccess() {
        await utils.package.all.invalidate();
        reset();
        imageRef.current?.reset();
        void Toast.fire({
          title: "El paquete ha sido añadido",
          icon: "success",
        });
        await router.replace("/admin/paquetes");
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
  const [productArray, setProductArray] = useState<Array<string>>();

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatePackageFormValues>({
    resolver: zodResolver(createPackageFormSchema),
  });

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects logoId and categories to package.
   *
   * @param {CreatePackageFormValues} data
   * @returns
   */
  async function submitForm(data: CreatePackageFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/package/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,   
      }));

    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }
    createPackage({
      ...data,
      products: productArray,
      imageId: imageResponse ? imageResponse.id : undefined,
    });
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof CreatePackageFormValues} field
   * @returns
   */
  function getError(field: keyof CreatePackageFormValues) {
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

  /**
   * Connects producer to the products.
   *
   * @param {string} productId
   */
  function handleAdd(productId: string) {
    setProductArray([...(productArray || []), productId]);
    submitForm;
  }

  /**
   * Deletes connection of producer to the products.
   *
   * @param {string} productId
   */
  function handleRemove(productId: string) {
    const newArray = productArray?.filter((id) => id !== productId);
    setProductArray(newArray);
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Nombre"
        {...register("name")}
        error={getError("name")}
      />
      <ParagraphFormElement
        label="Descripción corta"
        {...register("shortDescription")}
        error={getError("shortDescription")}
      />
      <Editor
        // @ts-expect-error TODO: fix this
        control={control}
        name="description"
        label="Descripción (Opcional)"
        error={getError("description")}
      />
      <PriceFormController
        // @ts-expect-error TODO: fix this
        control={control}
        label="Precio"
        name="price"
        error={getError("price")}
      />
      <ImageFormElement
        name="Imagen"
        error={imageError}
        size={size}
        image={base64Image}
        setImage={setBase64Image}
        ref={imageRef}
        altImage={altImage}
        setAltImage={setAltImage}
        setFileName={setFileName}
      />
      <div className="my-10">
        <ProductsTable
          handleRemove={handleRemove}
          handleAdd={handleAdd}
          AddFunc
          idArray={productArray}
          stateTd={false}
          approveTd={false}
          priceTd={false}
          stockTd={false}
          producerTd={false}
          buttonSubmit={false}
        />
      </div>
      <LinkElement
        href={`/admin/paquetes`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoPackage && !subiendoImg && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {(creadoPackage || subiendoImg) && (
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
