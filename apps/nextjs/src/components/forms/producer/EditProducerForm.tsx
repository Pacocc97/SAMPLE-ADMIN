import { useEffect, useRef, useState, type ElementRef } from "react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Image, Producer, Product } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  updateProducerFormSchema,
  type UpdateProducerFormValues,
} from "@acme/api/src/schemas/producerSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ComboboxElement from "../elements/ComboboxElement";
import EmailLoopFormElement from "../elements/EmailLoopFormElement";
import FormSteps from "../elements/FormSteps";
import ImageFormElement from "../elements/ImageFormElement";
import NumberFormElement from "../elements/NumberFormElement";
import PhoneLoopFormElement from "../elements/PhoneLoopFormElement";
import PriceFormController from "../elements/PriceFormController";

type MyProduct = Product & {
  Category: Category[] | null;
  image: Image;
};

interface CustomProducer {
  producer: Producer & {
    product: MyProduct[];
    logo: Image | null;
  };
}

export default function EditProducerForm({ producer }: CustomProducer) {
  const { data: session } = useSession({ required: true });
  const updateSlug = hasPermission(session, "update_producer_slug");
  const assignProducer = hasPermission(session, "assign_producer");

  const utils = trpc.useContext();
  const { data: productData } = trpc.product.all.useQuery();
  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutate: deleteImg } = trpc.image.delete.useMutation();

  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [stepForm, setStepForm] = useState("1");

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };
  const { mutate: updateProducer, isLoading: subiendoProducer } =
    trpc.producer.update.useMutation({
      async onSuccess() {
        await utils.producer?.show.invalidate({
          slug: producer?.slug || "",
        });

        await utils.producer.all.invalidate();
        void Toast.fire({
          title: "El fabricante ha sido editado",
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProducerFormValues>({
    resolver: zodResolver(updateProducerFormSchema),
    defaultValues: {
      name: producer.name,
      slug: producer.slug,
      product: producer.product,
      emails: producer.emails,
      phones: producer.phones,
      webSite: producer.webSite || undefined,
      location: producer.location,
    },
  });
  const myCategoriesArray = producer.product
    .map(
      (product) =>
        product.Category?.filter((category) => category.parentId === null)[0]
          ?.name,
    )
    .filter((category) => typeof category === "string");

  /**
   * Submits form data.
   * - Checks if image was submitted properly. Deletes previous image.
   * - Connects logoId, categories and products to producer.
   *
   * @param {UpdateProducerFormValues} data
   * @returns
   */
  async function submitForm(data: UpdateProducerFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/producer/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));

    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }

    if (producer?.logo && imageResponse) {
      deleteImg({
        id: producer.logo.id,
        path: producer.logo.path,
        original: producer.logo.original,
        webp: producer.logo.webp,
      });
    }
    updateProducer({
      ...data,
      id: producer.id,
      logoId: imageResponse ? imageResponse.id : undefined,
      categories: myCategoriesArray.map((res: string | undefined): string => {
        return res ? res : "";
      }),
    });
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof UpdateProducerFormValues} field
   * @returns
   */
  function getError(field: keyof UpdateProducerFormValues) {
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

  const steps = [
    {
      id: "Información del fabricante",
      paso: "1",
      status: stepForm === "1" ? "current" : "complete",
      error:
        errors.name ||
        errors.webSite ||
        errors.location ||
        errors.emails ||
        errors.phones ||
        imageError
          ? true
          : false,
    },
    {
      id: "Productos vinculados",
      paso: "2",
      status: stepForm === "2" ? "current" : "complete",
      // error,
    },
  ];

  const { fields, remove, append } = useFieldArray({
    name: "product",
    control,
  });
  return (
    <>
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 dark:border-gray-500 md:grid-cols-3">
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
                className="-mb-12 sm:col-span-3"
                {...register("name")}
                error={getError("name")}
              />
              {updateSlug.status && (
                <TextFormElement
                  {...register("slug")}
                  className="-mb-12 sm:col-span-3"
                  error={getError("slug")}
                  dangerous={true}
                />
              )}
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
                className="-mb-8 sm:col-span-3"
                label="Correos Electrónicos"
                name="emails"
                inputType="email"
                error={getError("emails")}
              />
              <PhoneLoopFormElement
                // @ts-expect-error TODO: fix this
                control={control}
                className="-mb-8 sm:col-span-3"
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
                  defaultImage={producer.logo ? producer.logo : undefined}
                  altImage={altImage}
                  setAltImage={setAltImage}
                  setFileName={setFileName}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 dark:border-gray-500 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                Productos del fabricante
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                los productos que el fabricante provee. Con tiempos de entrega y
                precio de compra de cada producto.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-6 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2 md:grid-cols-11">
              {assignProducer &&
                productData &&
                fields.map((field, index) => {
                  return (
                    <>
                      {/* <section className={"section"} key={field.id}> */}

                      <ComboboxElement
                        // @ts-expect-error TODO: fix this
                        control={control}
                        label="Producto"
                        name={`product.${index}.product`}
                        data={productData as any}
                        className="col-span-5 -mb-12"
                        isProduct
                        // error={getError("producer")}
                      />
                      <PriceFormController
                        // @ts-expect-error TODO: fix this
                        control={control}
                        name={`product.${index}.price`}
                        label="Precio producto"
                        className="col-span-3 -mb-12"
                        // error={getError("price")}
                      />
                      <NumberFormElement
                        label="entregas"
                        {...register(`product.${index}.delivery`, {
                          max: 99999999,
                          min: 100,
                          valueAsNumber: true,
                        })}
                        textIn="Días"
                        className="col-span-2 -mb-12"
                        // error={getError("stockWarn")}
                      />
                      {/* </section> */}
                      <button
                        className="-mb-12 -ml-px -mt-12 block h-11 w-12 items-center space-x-2 rounded-md border border-red-300 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none dark:border-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-500 md:mt-6"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        X
                      </button>
                    </>
                  );
                })}
              {assignProducer && (
                <button
                  type="button"
                  className="col-span-12 -ml-px mb-4  block items-center space-x-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  onClick={() =>
                    append({
                      product: undefined,
                      price: 0,
                      delivery: 0,
                    })
                  }
                >
                  Agregar productos
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <LinkElement
            href={`/admin/fabricante/${producer.slug}`}
            size="sm"
            intent="primary"
            className="mr-2"
          >
            Volver
          </LinkElement>
          {!subiendoProducer && !subiendoImg && (
            <ButtonElement type="submit" intent="primary">
              Subir
            </ButtonElement>
          )}
          {(subiendoProducer || subiendoImg) && (
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
    </>
  );
}
