import { useEffect, useRef, useState, type ElementRef } from "react";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Image, Prisma, Seo } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  updateCategoryFormSchema,
  type UpdateCategoryFormValues,
} from "@acme/api/src/schemas/categorySchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import { classNames } from "~/utils/object";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import FormSteps from "../elements/FormSteps";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import SelectFormElementLoop from "../elements/SelectFormElementLoop";
import { SeoSection } from "../seo/SeoSection";

export type Characteristics = {
  name?: string;
  type?: string;
  unit?: string;
};

type ErrorType = {
  message: string;
  // Other properties if needed
};

export interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
  characteristics: Prisma.JsonValue | null;
  child: Category[];
  parent: Category;
  slug: string | null;
  description: string | null;
  imageId: string | null;
  image: Image | null;
  seo: Seo & {
    openGraphBasicImage?: Image | undefined;
  };
}

export default function EditCategoryForm({
  category,
}: {
  category: Category & {
    image?: Image;
    seo: Seo & {
      openGraphBasicImage?: Image | null;
    };
  };
}) {
  const router = useRouter();
  const { paso, seoSec } = router.query;
  const utils = trpc.useContext();
  const categories = trpc.category.all.useQuery();
  const categoryOptions = categories.data?.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    characteristics: category.characteristics,
    parent: category.parent,
    child: category.child,
    imageId: category.imageId,
    image: category.image,
  }));

  const { data: session } = useSession({ required: true });
  const updateSlug = hasPermission(session, "update_category_slug");
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [myCategory, setMiCategory] = useState<MyCategory>();
  const [categorys, setCategorys] = useState<MyCategory[]>();
  const [checked, setChecked] = useState(false);
  const [checkedSub, setCheckedSub] = useState(false);
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

  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();

  const { mutate: deleteImg } = trpc.image.delete.useMutation();

  // const { mutate: updateProduct, isLoading: subiendoProduct } =
  // trpc.product.update.useMutation({
  //   async onSuccess() {
  //     // await utils.product?.show.invalidate({
  //     //   slug: product?.slug || "",
  //     // });
  //   void  Toast.fire({
  //       title: "El producto ha sido actualizado!",
  //       icon: "success",
  //     });
  //   },
  //   async onError(e) {
  //     await Toast.fire({
  //       title: e.message,
  //       icon: "error",
  //     });
  //   },
  // });

  const { mutate: updateCategory, isLoading: subiendoCategory } =
    trpc.category.update.useMutation({
      async onSuccess() {
        await utils.category.all.invalidate();
        void Toast.fire({
          title: "La categoría ha sido actualizada!",
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(updateCategoryFormSchema),
    defaultValues: {
      name: category.name,
      slug: category.slug || undefined,
      description: category.description || undefined,
      characteristics: category.characteristics as Characteristics[],
      seo: {
        ...(category?.seo || undefined),
        openGraphBasicImageId: category?.seo.openGraphBasicImageId || undefined,
      },
    },
  });
  const { fields, remove, append } = useFieldArray({
    name: "characteristics",
    control,
  });

  const steps = [
    {
      id: "Información de la categoría",
      paso: "1",
      status: pasoCompra === "1" ? "current" : "complete",
      error: errors.name || errors.description ? true : false,
    },
    {
      id: "Características de la categoría",
      paso: "2",
      status: pasoCompra === "2" ? "current" : "complete",
      error: errors.characteristics ? true : false,
    },
    {
      id: "SEO",
      paso: "3",
      status: pasoCompra === "3" ? "current" : "complete",
      error: errors.seo ? true : false,
    },
  ];

  /**
   * When form is submitted, updates categoría based on passed data.
   *
   * @param {UpdateCategoryFormValues} data
   */
  async function submitForm(data: UpdateCategoryFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/category/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));

    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }

    if (category?.image && imageResponse) {
      deleteImg({
        id: category.image.id,
        path: category.image.path,
        original: category.image.original,
        webp: category.image.webp,
      });
    }

    const imageOpResponse =
      baseOpImage &&
      (await imageMutator({
        path: "images/category/image/openGraphBasicImage",
        image: baseOpImage,
        size: size,
        alt: altOpImage,
        name: fileOpName,
      }));

    if (baseOpImage && imageOpResponse === undefined) {
      setImageOpError("Algo salió mal mientas se subía la imagen");
      return;
    }

    if (category?.seo.openGraphBasicImage && imageOpResponse) {
      deleteImg({
        id: category.seo.openGraphBasicImage.id,
        path: category.seo.openGraphBasicImage.path,
        original: category.seo.openGraphBasicImage.original,
        webp: category.seo.openGraphBasicImage.webp,
      });
    }
    updateCategory({
      ...data,
      id: category.id,
      imageId: imageResponse ? imageResponse.id : undefined,
      parentId: myCategory ? myCategory.id : null,
      checked: checked,
      seo: {
        ...data.seo,
        openGraphBasicImageId: imageOpResponse ? imageOpResponse.id : undefined,
      },
    });
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof UpdateCategoryFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof UpdateCategoryFormValues, subField?: string) {
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

  /**
   * Sets categories with an array of objects of selected categories.
   *
   * @param {MyCategory} value
   */
  function myCategories(value: MyCategory) {
    if (value) {
      if (value.parent === null) {
        setMiCategory(value);
        setCategorys([value]);
      } else if (categorys?.some((cat) => cat.parentId === value.parentId)) {
        const valorcito = categorys.find(
          (cat: MyCategory) => cat?.parentId === value.parentId,
        );
        const indexOld = categorys.findIndex(
          (cat: MyCategory) => cat?.id === valorcito?.id,
        );
        if (!categorys.some((cat: MyCategory) => cat.id === value.id)) {
          let arr = [];
          arr = categorys.slice(0, indexOld);
          setCategorys(arr);
        }
        setCategorys((categorys) => [...(categorys || []), value]);
        setMiCategory(value);
      } else {
        setCategorys((categorys) => [...(categorys || []), value]);
        setMiCategory(value);
      }
    }
  }

  /**
   * Generates new select inputs based on the children options of the selected category.
   *
   * @returns {JSX.Element[]} SelectFormElementLoop
   */
  function SubCategories() {
    const cantidad = categorys?.filter(
      (cat) => cat.child && cat.child.length > 0,
    ).length;
    const td = [];
    for (let i = 0; i < (cantidad as number); i++) {
      td.push(
        <SelectFormElementLoop
          key={i}
          // @ts-expect-error TODO: fix this
          control={control}
          name={`Subcategoría ${i + 1}`}
          // error={getError('Category')}
          data={categorys?.[i]?.child}
          setMiCategory={myCategories}
          defaultValue={categorys?.[i + 1]}
        />,
      );
    }
    return td;
  }
  const handleClick = async () => {
    if (!checked) {
      await ConfirmModal.fire({
        confirmButtonText: "Sí, seguir!",
        text: "Se desvincularán todos los productos de esta categoría",
      }).then((result) => {
        if (result.isConfirmed) {
          setChecked(!checked);
        }
      });
    } else {
      setChecked(!checked);
    }
  };

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
    if (baseOpImage) {
      setImageOpError(undefined);
    }
  }, [base64Image, baseOpImage]);

  return (
    <>
      <FormSteps steps={steps} setPasoCompra={setPasoCompra} />
      <form onSubmit={handleSubmit(submitForm)}>
        {pasoCompra === "1" ? (
          <div>
            <TextFormElement
              label="Nombre"
              {...register("name")}
              error={getError("name")}
            />
            {updateSlug.status && (
              <TextFormElement
                {...register("slug")}
                error={getError("slug")}
                dangerous={true}
                className="mb-0"
              />
            )}
            <ParagraphFormElement
              label="Descripción"
              {...register("description")}
              error={getError("description")}
            />
            <ImageFormElement
              name="Imagen"
              error={imageError}
              size={size}
              image={base64Image}
              setImage={setBase64Image}
              ref={imageRef}
              defaultImage={category?.image}
              altImage={altImage}
              setAltImage={setAltImage}
              setFileName={setFileName}
            />
            <div className="mb-6">
              <input
                onClick={handleClick}
                defaultChecked={checked}
                type="checkbox"
                id="scales"
                name="scales"
                checked={checked}
              />
              <label htmlFor="scales" className="ml-5">
                Desea cambiar el orden de la categoría?
              </label>
            </div>
            {checked && (
              <>
                <div className="mb-6">
                  <input
                    onClick={() => setCheckedSub(!checkedSub)}
                    defaultChecked={checkedSub}
                    type="checkbox"
                    id="scales"
                    name="scales"
                    checked={checkedSub}
                  />
                  <label htmlFor="scales" className="ml-5">
                    Es una subcategoría?
                  </label>
                </div>
                {checkedSub && (
                  <SelectFormElementLoop
                    // @ts-expect-error TODO: fix this
                    control={control}
                    name="Categoría"
                    // error={getError('Category')}
                    data={categoryOptions && categoryStructure(categoryOptions)}
                    myCategory={myCategory}
                    setMiCategory={myCategories}
                    defaultValue={myCategory}
                  />
                )}
              </>
            )}
            {SubCategories()}
          </div>
        ) : pasoCompra === "2" ? (
          <div>
            <button
              type="button"
              className="-ml-px mb-4  block items-center space-x-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onClick={() =>
                append({
                  name: "",
                  type: "",
                  unit: "",
                })
              }
            >
              Agregar Características
            </button>
            <h2 className="mb-2 mt-2 text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
              Características
            </h2>
            <div>
              {fields.map((field, i) => {
                return (
                  <div className="mb-2" key={field.id}>
                    <div className="inline-block">
                      <label
                        htmlFor="characteristics"
                        className="mb-2  text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
                      >
                        Nombre
                      </label>
                      <label
                        htmlFor="characteristics"
                        className="mb-2 ml-20 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
                      >
                        Tipo
                      </label>
                      <label
                        htmlFor="characteristics"
                        className="mb-2 ml-11 text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
                      >
                        Unidad
                      </label>
                    </div>
                    <div
                      className={classNames(
                        // error ? '' : 'mb-12',
                        "relative flex flex-grow items-stretch  focus-within:z-10",
                      )}
                    >
                      <input
                        {...register(`characteristics.${i}.id`)}
                        type="text"
                        className={classNames(
                          // getError(field.name)
                          //   ? 'border-red-500'
                          //   : 'border-gray-300 dark:border-gray-600',
                          "sr-only",
                        )}
                      />
                      <input
                        {...register(`characteristics.${i}.name`)}
                        type="text"
                        className={classNames(
                          // getError(field.name)
                          //   ? 'border-red-500'
                          //   : 'border-gray-300 dark:border-gray-600',
                          "block w-full rounded-l-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
                        )}
                      />
                      <div className="inset-y-0 right-0 flex items-center">
                        <label htmlFor="currency" className="sr-only">
                          Características
                        </label>
                        <select
                          id="currency"
                          disabled={field.type !== ""}
                          {...register(`characteristics.${i}.type`)}
                          className="block border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="range">Rango</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        {...register(`characteristics.${i}.unit`)}
                        placeholder="Unit"
                        className={classNames(
                          // addMore || removable ? '' : 'rounded-r-lg',
                          // error
                          //   ? 'border-red-500'
                          //   : 'border-gray-300 dark:border-gray-600',
                          // dangerous && !safe ? 'rounded-r-none' : '',
                          "block w-full  border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
                        )}
                      />
                      {/* {removable && ( */}
                      <button
                        title="Quitar característica"
                        onClick={() => {
                          remove(i);
                        }}
                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <span>—</span>
                      </button>
                      {/* )} */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
        <div className="mt-2.5 flex justify-end py-5">
          <LinkElement
            href={`/admin/categorias_producto/${category?.slug}`}
            size="sm"
            intent="primary"
            className="mr-2"
          >
            Volver
          </LinkElement>
          {!subiendoCategory && !subiendoImg && (
            <ButtonElement type="submit" intent="primary">
              Subir
            </ButtonElement>
          )}
          {(subiendoCategory || subiendoImg) && (
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
