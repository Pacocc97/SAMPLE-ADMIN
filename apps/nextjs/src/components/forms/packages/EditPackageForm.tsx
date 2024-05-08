import { useEffect, useRef, useState, type ElementRef } from "react";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  updatePackageFormSchema,
  type UpdatePackageFormValues,
} from "@acme/api/src/schemas/packageSchema";
import { type CreateSeoFormValues } from "@acme/api/src/schemas/seoSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import ProductsTable from "~/components/ProductsTable";
import Editor from "~/components/editor/Editor";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import FormSteps from "../elements/FormSteps";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import PriceFormController from "../elements/PriceFormController";
import { SeoSection } from "../seo/SeoSection";
import {
  type Image,
  type Product,
  type ProductPackage,
  type Seo,
} from ".prisma/client";

type ProductPack = ProductPackage & {
  image: Image | null;
  seo: Seo & {
    openGraphBasicImage?: Image | null;
  };
  products: (Product & {
    image: Image;
  })[];
};
type ErrorType = {
  message: string;
  // Other properties if needed
};
export default function EditPackageForm({
  productPackage,
}: {
  productPackage: ProductPack;
}) {
  const productsId = productPackage.products.map((product) => product.id);
  const router = useRouter();
  const { paso, seoSec } = router.query;
  const utils = trpc.useContext();
  const { mutate: updatePackage, isLoading: creadoPackage } =
    trpc.package.update.useMutation({
      async onSuccess() {
        await utils.package.all.invalidate();
        void Toast.fire({
          title: "El paquete ha sido añadido",
          icon: "success",
        });
      },
      async onError(error) {
        await Toast.fire({
          title: "El paquete no se pudo añadir",
          icon: "error",
        });
      },
    });
  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutate: deleteImg } = trpc.image.delete.useMutation();

  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [fileName, setFileName] = useState<string>();
  const [productArray, setProductArray] = useState<Array<string>>(productsId);
  const [pasoCompra, setPasoCompra] = useState(paso ? paso : "1");
  const [imageOpError, setImageOpError] = useState<string | undefined>();
  const [baseOpImage, setBaseOpImage] = useState<string>();
  const [fileOpName, setFileOpName] = useState<string>();
  const [altOpImage, setAltOpImage] = useState<string | null>();

  const imageOpRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  const arr = [
    { flag: true, other: 1 },
    { flag: true, other: 2 },
    { flag: false, other: 3 },
    { flag: true, other: 4 },
    { flag: true, other: 5 },
    { flag: true, other: 6 },
    { flag: false, other: 7 },
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdatePackageFormValues>({
    resolver: zodResolver(updatePackageFormSchema),
    defaultValues: {
      name: productPackage?.name || undefined,
      slug: productPackage?.slug,
      description: productPackage?.description || undefined,
      shortDescription: productPackage?.shortDescription || undefined,
      price: productPackage?.price,
      seo: {
        ...(productPackage?.seo || undefined),
        openGraphBasicImageId:
          productPackage?.seo.openGraphBasicImageId || undefined,
      },
    },
  });

  const steps = [
    {
      id: "Información del producto",
      paso: "1",
      status: pasoCompra === "1" ? "current" : "complete",
      error:
        errors.name ||
        errors.description ||
        errors.shortDescription ||
        errors.price
          ? true
          : false,
    },
    {
      id: "SEO",
      paso: "2",
      status: pasoCompra === "2" ? "current" : "complete",
      error: errors.seo ? true : false,
    },
  ];

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects logoId and categories to package.
   *
   * @param {UpdatePackageFormValues} data
   * @returns
   */
  async function submitForm(data: UpdatePackageFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/package/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));

    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }

    if (productPackage?.image && imageResponse) {
      deleteImg({
        id: productPackage.image.id,
        path: productPackage.image.path,
        original: productPackage.image.original,
        webp: productPackage.image.webp,
      });
    }

    const imageOpResponse =
      baseOpImage &&
      (await imageMutator({
        path: "images/package/image/openGraphBasicImage",
        image: baseOpImage,
        size: size,
        alt: altOpImage,
        name: fileOpName,
      }));
    if (baseOpImage && imageOpResponse === undefined) {
      setImageOpError("Algo salió mal mientas se subía la imagen");
      return;
    }

    if (productPackage?.seo.openGraphBasicImage && imageOpResponse) {
      deleteImg({
        id: productPackage.seo.openGraphBasicImage.id,
        path: productPackage.seo.openGraphBasicImage.path,
        original: productPackage.seo.openGraphBasicImage.original,
        webp: productPackage.seo.openGraphBasicImage.webp,
      });
    }

    updatePackage({
      ...data,
      id: productPackage.id,
      imageId: imageResponse && imageResponse.id,
      products: productArray,
      seo: {
        ...data.seo,
        openGraphBasicImageId: imageOpResponse ? imageOpResponse.id : undefined,
      },
    });
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof UpdatePackageFormValues} field
   * @returns
   */
  function getError(field: keyof UpdatePackageFormValues, subField?: string) {
    if (errors[field]) {
      if (subField) {
        // Use type assertion to indicate the structure
        const fieldErrors = errors[field] as { [key: string]: ErrorType };
        const nestedError = fieldErrors[subField]?.message;
        return nestedError;
      }
      return errors[field]?.message;
    }
    return undefined;
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
    if (baseOpImage) {
      setImageOpError(undefined);
    }
  }, [base64Image, baseOpImage]);

  /**
   * Connects producer to the products.
   *
   * @param {string} productId
   */
  function handleAdd(productId: string) {
    setProductArray([...productArray, productId]);
    submitForm;
  }

  /**
   * Deletes connection of producer to the products.
   *
   * @param {string} productId
   */
  function handleRemove(productId: string) {
    const newArray = productArray.filter((id) => id !== productId);
    setProductArray(newArray);
  }

  return (
    <>
      <FormSteps steps={steps} setPasoCompra={setPasoCompra} />
      <form onSubmit={handleSubmit(submitForm)}>
        {pasoCompra === "1" ? (
          <>
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
              defaultImage={
                productPackage.image ? productPackage.image : undefined
              }
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
                sortedAdded
              />
            </div>
          </>
        ) : (
          <SeoSection
            register={register}
            control={control}
            getError={getError}
            imageOpError={imageOpError}
            sizeOp={size}
            baseOpImage={baseOpImage}
            setBaseOpImage={setBaseOpImage}
            imageOpRef={imageOpRef}
            seoSec={seoSec}
            errors={errors.seo}
            setFileName={setFileOpName}
            setAltImage={setAltOpImage}
            altImage={altOpImage}
          />
        )}
        <LinkElement
          href={`/admin/paquetes/${productPackage?.slug}`}
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
    </>
  );
}
