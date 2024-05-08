import { useEffect, useRef, useState, type ElementRef } from "react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Image, Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  createTypeFormSchema,
  createUnitFormSchema,
  type CreatUnitFormValues,
  type CreateTypeFormValues,
} from "@acme/api/src/schemas/extraSchema";
import {
  createProductFormSchema,
  type CreateProductFormValues,
} from "@acme/api/src/schemas/productSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import Editor from "~/components/editor/Editor";
import FormSteps from "~/components/forms/elements/FormSteps";
import ImageFormElement from "~/components/forms/elements/ImageFormElement";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
// import AdminProductOfProducer from "../elements/AdminProductOfProducer";
import ComboboxElement from "../elements/ComboboxElement";
import GifFormElement from "../elements/GifFormElement";
import ImageExtraFormElement from "../elements/ImageExtraFormElement";
import NumberFormElement from "../elements/NumberFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import PdfFormElement from "../elements/PdfFormElement";
import PriceFormController from "../elements/PriceFormController";
import SelectFormElement from "../elements/SelectFormElement";
import SelectFormElementLoop from "../elements/SelectFormElementLoop";
import SideFormElement from "../elements/SideFormElement";
import TagsElement from "../elements/TagsFormElement";

interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
  characteristics: Prisma.JsonValue | null;
  child: Category[];
  parent: Category;
  description: string | null;
  slug: string;
  imageId: string;
  image: Image;
}

export default function CreateProductForm() {
  const { data: session } = useSession({ required: true });
  const canDeleteTipo = hasPermission(session, "delete_type");
  const canDeleteUnidad = hasPermission(session, "delete_unit");
  const assignProducer = hasPermission(session, "assign_producer");

  const utils = trpc.useContext();
  const { data: producerData } = trpc.producer.all.useQuery();
  const typeData = trpc.type.all.useQuery();
  const unitData = trpc.unit.all.useQuery();
  const type = typeData.data?.map((type) => ({
    id: type.name,
    name: type.name,
  }));
  const unit = unitData.data?.map((unit) => ({
    id: unit.name,
    name: unit.name,
  }));
  const [openType, setOpenType] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [brochureError, setBrochureError] = useState<string | undefined>(
    undefined,
  );
  const [baseBrochure, setBaseBrochure] = useState<string>();
  const [nameBrochure, setNameBrochure] = useState<string>();
  const [manualError, setManualError] = useState<string | undefined>(undefined);
  const [baseManual, setBaseManual] = useState<string>();
  const [nameManual, setNameManual] = useState<string>();
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [imagesExtra1, setImagesExtra1] = useState<string | undefined>("");
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [baseGif, setBaseGif] = useState<string>();
  const [gifName, setGifName] = useState<string>();
  const [gifError, setGifError] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<MyCategory[]>();
  const [formSteps, setFormSteps] = useState("1");

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const brochureRef = useRef<ElementRef<typeof PdfFormElement>>(null);
  const manualRef = useRef<ElementRef<typeof PdfFormElement>>(null);
  const gifRef = useRef<ElementRef<typeof GifFormElement>>(null);

  const { mutateAsync: brochureMutator, isLoading: subiendoBrochure } =
    trpc.pdf.create.useMutation();
  const { mutateAsync: manualMutator, isLoading: subiendoManual } =
    trpc.pdf.create.useMutation();
  const { mutateAsync: gifMutator, isLoading: subiendoGif } =
    trpc.gif.create.useMutation();
  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutate: crearProduct, isLoading: subiendoProduct } =
    trpc.product.create.useMutation({
      onSuccess() {
        imageRef.current?.reset();
        brochureRef.current?.reset();
        manualRef.current?.reset();
        reset();

        void Toast.fire({
          title: "El product ha sido agregado",
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
  const { mutate: crearTipo } = trpc.type.create.useMutation({
    async onSuccess() {
      resetTipo();
      false;
      await Toast.fire({
        title: "Tipo agregado!",
        icon: "success",
      });
      await utils.type.all.invalidate();
    },
  });
  const { mutate: crearUnidad } = trpc.unit.create.useMutation({
    async onSuccess() {
      resetUnidad();
      false;
      await Toast.fire({
        title: "Unidad agregada!",
        icon: "success",
      });
      await utils.unit.all.invalidate();
    },
  });
  const { mutate: deleteTipo } = trpc.type.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El type ha sido borrado!",
        icon: "success",
      });
      await utils.type.all.invalidate();
    },
  });
  const { mutate: deleteUnidad } = trpc.unit.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La unit ha sido borrada!",
        icon: "success",
      });
      await utils.unit.all.invalidate();
    },
  });

  useEffect(() => {
    if (imageArray.includes(imagesExtra1 ? imagesExtra1 : "")) {
      return;
    } else {
      if (imageArray && imagesExtra1) {
        const result: string[] = [...imageArray, imagesExtra1];
        setImageArray(result.filter((n) => n).reverse());
      }
    }
  }, [imagesExtra1, imageArray]);
  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
    if (baseBrochure) {
      setBrochureError(undefined);
    }
    if (baseManual) {
      setManualError(undefined);
    }
  }, [base64Image, baseBrochure, baseManual]);

  const size: Size = {
    width: undefined,
    height: undefined,
  };
  const category = trpc.category.all.useQuery();
  const categoryOptions =
    category.data?.map((category) => ({
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
    })) || [];
  let IMGADICIONAL: string[] | null = null;
  let BROCHURE: string | null = null;
  let MANUAL: string | null = null;
  let GIF: string | null = null;

  /**
   * Sets imageExtra1 as a string.
   * @todo check functionality of imageExtra1
   *
   * @param {string | undefined} image
   */
  function defineImage(image: string | undefined) {
    setImagesExtra1(image);
  }

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} name
   * @param {string} value
   */
  async function deleteExtraHandler(name: string, value: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (value === "type") {
          deleteTipo({ name });
        }
        if (value === "unit") {
          deleteUnidad({ name });
        }
      }
    });
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
  });

  const {
    register: registroTipo,
    handleSubmit: subirTipo,
    formState: { errors: errorTipo },
    reset: resetTipo,
  } = useForm<CreateTypeFormValues>({
    resolver: zodResolver(createTypeFormSchema),
  });

  const {
    register: registroUnidad,
    handleSubmit: subirUnidad,
    formState: { errors: errorUnidad },
    reset: resetUnidad,
  } = useForm<CreatUnitFormValues>({
    resolver: zodResolver(createUnitFormSchema),
  });

  /**
   * When form is submitted, creates new product based on passed data.
   *
   * @param {CreateProductFormValues} data
   */
  async function submitForm(data: CreateProductFormValues) {
    if (base64Image === undefined) {
      setImageError("Porfavor suba una image");
      return;
    }

    const imageResponse = await imageMutator({
      path: "images/product/image",
      image: base64Image,
      size,
      alt: altImage,
      name: fileName,
    });

    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la image");
      return;
    }
    if (baseGif !== undefined) {
      const imageResponse = await gifMutator({
        path: "images/product/gif",
        image: baseGif,
        size,
        name: gifName,
      });
      if (imageResponse === undefined) {
        setGifError("Algo salió mal mientas se subía la image");
        return;
      } else {
        GIF = imageResponse.id;
      }
    }
    if (baseBrochure !== undefined) {
      const brochureResponse = await brochureMutator({
        path: "pdf/product/FichaTecnica",
        pdf: baseBrochure,
        name: nameBrochure,
      });
      if (brochureResponse === undefined) {
        setBrochureError("Algo salió mal mientas se subía la ficha técnica");
        return;
      } else {
        BROCHURE = brochureResponse?.id;
      }
    }
    if (baseManual !== undefined) {
      const manualResponse = await manualMutator({
        path: "pdf/product/Manual",
        pdf: baseManual,
        name: nameManual,
      });
      if (manualResponse === undefined) {
        setManualError("Algo salió mal mientas se subía el manual");
        return;
      } else {
        MANUAL = manualResponse?.id;
      }
    }
    if (imageArray.length !== 0) {
      const imageResponse = await Promise.all(
        imageArray
          .filter((n) => n)
          .map(async (image) => {
            return await imageMutator({
              path: "images/product/image",
              image: image,
              size,
            });
          }),
      );
      setImageArray([]);
      setImagesExtra1("");
      IMGADICIONAL = imageResponse.map(
        (res: Image | undefined | null): string => {
          return res ? res.id : "";
        },
      );
    }
    crearProduct({
      ...data,
      imageId: imageResponse?.id,
      category: categories?.map((cat) => cat.id),
      imagesExtra: IMGADICIONAL,
      brochureId: BROCHURE,
      manualId: MANUAL,
      gifId: GIF ?? undefined,
      user: session?.user?.id,
    });
  }

  /**
   * When form is submitted, creates new type of product based on passed data.
   *
   * @param {CreateTypeFormValues} data
   */
  function submitFormType(data: CreateTypeFormValues) {
    true;
    crearTipo({
      ...data,
    });
  }

  /**
   * When form is submitted, creates new unit of product based on passed data.
   *
   * @param {CreatUnitFormValues} data
   */
  function submitFormUnit(data: CreatUnitFormValues) {
    true;
    crearUnidad({
      ...data,
    });
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateProductFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof CreateProductFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateTypeFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getErrorType(field: keyof CreateTypeFormValues) {
    if (errorTipo[field]) {
      return errorTipo[field]?.message;
    }
    return undefined;
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreatUnitFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getErrorUnit(field: keyof CreatUnitFormValues) {
    if (errorUnidad[field]) {
      return errorUnidad[field]?.message;
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
        setCategories([value]);
        // setValue('Subcategory Product 1', null);
        resetField("Subcategory1");
      } else if (categories?.map((cat) => cat.id).includes(value.id)) {
        return;
      } else if (categories?.some((cat) => cat.parentId === value.parentId)) {
        const myVal = categories?.find(
          (cat: MyCategory) => cat?.parentId === value.parentId,
        );
        const indexOld = categories?.findIndex(
          (cat: MyCategory) => cat?.id === myVal?.id,
        );
        if (!categories?.some((cat: MyCategory) => cat.id === value.id)) {
          let arr = [];
          arr = categories.slice(0, indexOld);
          setCategories(arr);
        }
        setCategories((categories) => [...(categories || []), value]);
      } else {
        setCategories((categories) => [...(categories || []), value]);
      }
    }
  }

  /**
   * Generates new select inputs based on the children options of the selected category.
   *
   * @returns {JSX.Element[]} SelectFormElementLoop
   */
  function SubCategories() {
    const cantidad = categories?.filter(
      (cat: MyCategory) => cat.child && cat.child.length > 0,
    ).length;
    const td = [];

    for (let i = 0; i < (cantidad as number); i++) {
      td.push(
        <SelectFormElementLoop
          // @ts-expect-error TODO: fix this
          control={control}
          name={`Subcategory${i + 1}`}
          label={`Subcategoría ${i + 1}`}
          // error={getError('Category')}
          data={categories?.[i]?.child}
          // miCategory={miCategory}
          setMiCategory={myCategories}
          shouldUnregister={true}
          key={i}
          className="-mb-6 sm:col-span-4"
        />,
      );
    }
    return td;
  }

  const { fields, remove, append } = useFieldArray({
    name: "producer",
    control,
  });

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12  dark:border-gray-500 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                Producto
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Información principal del producto.
              </p>
            </div>

            <div className="-gap-y-8 grid max-w-2xl grid-cols-1 gap-x-6 sm:grid-cols-6 md:col-span-2">
              <TextFormElement
                label="Nombre"
                {...register("name")}
                error={getError("name")}
                className="-mb-6 sm:col-span-4"
              />
              <TextFormElement
                label="Marca"
                {...register("brand")}
                error={getError("brand")}
                className="-mb-6 sm:col-span-4"
              />
              <SelectFormElementLoop
                // @ts-expect-error TODO: fix this
                control={control}
                name="Category"
                label="Categoría (Opcional)"
                // error={getError('Category')}
                data={categoryStructure(categoryOptions)}
                // miCategory={miCategory}
                setMiCategory={myCategories}
                className="-mb-6 sm:col-span-4"
              />
              {SubCategories()}
              <PriceFormController
                // @ts-expect-error TODO: fix this
                control={control}
                label="Precio"
                name="price"
                error={getError("price")}
                className="-mb-6 sm:col-span-3"
              />
              <PriceFormController
                // @ts-expect-error TODO: fix this
                control={control}
                label="Precio Sugerido (Opcional)"
                name="suggestedPrice"
                error={getError("suggestedPrice")}
                className="-mb-6 sm:col-span-3"
              />
              <ParagraphFormElement
                label="Descripción corta"
                {...register("shortDescription")}
                error={getError("shortDescription")}
                className="col-span-full -mb-6"
              />
              <Editor
                // @ts-expect-error TODO: fix this
                control={control}
                name="description"
                label="Descripción (Opcional)"
                error={getError("description")}
                className="col-span-full -mb-6"
              />
              <TextFormElement
                optional={true}
                {...register("SKU")}
                error={getError("SKU")}
                className="col-span-3 -mb-6"
              />
              <TextFormElement
                optional={true}
                label="Código de barras"
                {...register("barcode")}
                error={getError("barcode")}
                className="col-span-3 -mb-6"
              />
              <NumberFormElement
                label="Inventario"
                {...register("stock", {
                  max: 99999999,
                  min: 0,
                  valueAsNumber: true,
                })}
                error={getError("stock")}
                className="-mb-6 sm:col-span-3"
              />
              <NumberFormElement
                label="Umbral de inventario"
                {...register("stockWarn", {
                  max: 99999999,
                  min: 0,
                  valueAsNumber: true,
                })}
                error={getError("stockWarn")}
                className="-mb-6 sm:col-span-3"
              />
              <SelectFormElement
                // @ts-expect-error TODO: fix this
                control={control}
                label="Unidad (Opcional)"
                name="unit"
                error={getError("unit")}
                data={unit}
                deleteFunction={deleteExtraHandler}
                openCreate={setOpenUnit}
                canDelete={canDeleteTipo.status}
                className="-mb-6 sm:col-span-3"
              />
              <SelectFormElement
                // @ts-expect-error TODO: fix this
                control={control}
                label="Tipo (Opcional)"
                name="type"
                error={getError("type")}
                data={type}
                deleteFunction={deleteExtraHandler}
                openCreate={setOpenType}
                canDelete={canDeleteUnidad.status}
                className="-mb-6 sm:col-span-3"
              />
              <TagsElement
                // @ts-expect-error TODO: fix this
                control={control}
                name="tags"
                error={getError("tags")}
                className="-mb-6 sm:col-span-4"
              />
              <PdfFormElement
                name="Ficha Técnica (Opcional)"
                error={brochureError}
                pdf={baseBrochure}
                setPdf={setBaseBrochure}
                ref={brochureRef}
                setFileName={setNameBrochure}
                className="col-span-3"
              />
              <PdfFormElement
                name="Manual (Opcional)"
                error={manualError}
                pdf={baseManual}
                setPdf={setBaseManual}
                ref={manualRef}
                setFileName={setNameManual}
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        {assignProducer && (
          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12  dark:border-gray-500 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                Fabricante
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Información del fabricante del producto.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1  gap-x-6  sm:grid-cols-6 md:col-span-2 md:grid-cols-11">
              {assignProducer &&
                producerData &&
                fields.map((field, index) => {
                  return (
                    <>
                      {/* <div className="grid  md:grid-cols-7" key={field.id}> */}
                      {/* <section className={"section"} key={field.id}> */}

                      <ComboboxElement
                        // @ts-expect-error TODO: fix this
                        control={control}
                        label="Fabricante"
                        name={`producer.${index}.producer`}
                        data={producerData}
                        className="col-span-5 -mb-6"
                        // error={getError("producer")}
                      />
                      <PriceFormController
                        // @ts-expect-error TODO: fix this
                        control={control}
                        name={`producer.${index}.price`}
                        label="Precio del producto"
                        className="col-span-3 -mb-6"
                        // error={getError("price")}
                      />
                      <NumberFormElement
                        label="Entregas"
                        {...register(`producer.${index}.delivery`, {
                          max: 99999999,
                          min: 100,
                          valueAsNumber: true,
                        })}
                        textIn="Días"
                        className="col-span-2 -mb-6"
                        // error={getError("stockWarn")}
                      />
                      {/* </section> */}
                      <button
                        className="-mb-6 -ml-px -mt-12 block h-11 w-12 items-center space-x-2 rounded-md border border-red-300 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none dark:border-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-500 md:mt-6"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        X
                      </button>
                      {/* </div> */}
                    </>
                  );
                })}
              <button
                type="button"
                className="col-span-12 -ml-px mb-4  block items-center space-x-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onClick={() =>
                  append({
                    producer: undefined,
                    price: 0,
                    delivery: 0,
                  })
                }
              >
                Agregar fabricante
              </button>
            </div>
          </div>
        )}
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12  dark:border-gray-500 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
              Dimensiones
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Datos de las dimensiones y el peso del producto.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
            <NumberFormElement
              label="Peso"
              {...register("weight", {
                max: 99999999,
                min: 0,
                valueAsNumber: true,
              })}
              error={getError("weight")}
              textIn="Gramos"
              className="-mb-6 sm:col-span-3"
            />

            <NumberFormElement
              label="Alto"
              {...register("height", {
                max: 99999999,
                min: 0,
                valueAsNumber: true,
              })}
              error={getError("height")}
              textIn="CM"
              className="-mb-6 sm:col-span-2 sm:col-start-1"
            />

            <NumberFormElement
              label="Ancho"
              {...register("width", {
                max: 99999999,
                min: 0,
                valueAsNumber: true,
              })}
              error={getError("width")}
              textIn="CM"
              className="-mb-6 sm:col-span-2"
            />
            <NumberFormElement
              label="Largo"
              {...register("length", {
                max: 99999999,
                min: 0,
                valueAsNumber: true,
              })}
              error={getError("length")}
              textIn="CM"
              className="-mb-6 sm:col-span-2"
            />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12  dark:border-gray-500 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
              Imágenes
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Suba las imagenes que mostraran como se ve el producto.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <ImageFormElement
                name="Imagen principal"
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
            <div className="col-span-full">
              <GifFormElement
                name="gif producto (opcional)"
                error={gifError}
                image={baseGif}
                setImage={setBaseGif}
                ref={gifRef}
                setFileName={setGifName}
              />
            </div>
            <div className="col-span-full">
              <ImageExtraFormElement
                name="imágenes adicionales (opcional)"
                error={imageError}
                size={size}
                setImage={defineImage}
                ref={imageRef}
                submitForm={submitForm}
                imageArray={imageArray}
                setImageArray={setImageArray}
                setImagesExtra1={setImagesExtra1}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <LinkElement
            intent="primary"
            size="sm"
            className="mr-2"
            href={`/admin/producto/`}
          >
            Volver
          </LinkElement>
          {!subiendoProduct &&
            !subiendoGif &&
            !subiendoBrochure &&
            !subiendoManual &&
            !subiendoImg && (
              <ButtonElement type="submit" intent="primary">
                Subir
              </ButtonElement>
            )}
          {subiendoProduct ||
            ((subiendoBrochure ||
              subiendoManual ||
              subiendoGif ||
              subiendoImg) && (
              <ButtonElement type="button" disabled intent="primary">
                <Spinner
                  classNameDiv="none"
                  classNameSVG="w-5 h-5 mr-3 animate-spin"
                />
                Subiendo...
              </ButtonElement>
            ))}
        </div>
      </form>
      <SideFormElement show={openType} onClose={setOpenType}>
        <h1 className="mb-5 text-3xl font-extrabold dark:text-white">
          Crear Tipo
        </h1>
        <form id="form2" onSubmit={subirTipo(submitFormType)}>
          <TextFormElement
            label="Nombre"
            {...registroTipo("name")}
            error={getErrorType("name")}
          />
          <ButtonElement form="form2" type="submit" intent="primary">
            Crear
          </ButtonElement>
        </form>
      </SideFormElement>
      <SideFormElement show={openUnit} onClose={setOpenUnit}>
        <h1 className="mb-5 text-3xl font-extrabold dark:text-white">
          Crear Unidad
        </h1>
        <form id="form3" onSubmit={subirUnidad(submitFormUnit)}>
          <TextFormElement
            label="Nombre"
            {...registroUnidad("name")}
            error={getErrorUnit("name")}
          />
          <ButtonElement form="form3" type="submit" intent="primary">
            Crear
          </ButtonElement>
        </form>
      </SideFormElement>
      <DevTool control={control} />
    </>
  );
}
