import { useEffect, useRef, useState, type ElementRef } from "react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Category,
  Gif,
  Image,
  ImagesExtra,
  Pdf,
  Prisma,
  Producer,
  ProducerOfProduct,
  Product,
  ProductComplement,
  ProductParts,
  ProductRelation,
  Seo,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useFieldArray, useForm } from "react-hook-form";
import { AnyComponent } from "styled-components/dist/types";

import {
  createTypeFormSchema,
  createUnitFormSchema,
  type CreatUnitFormValues,
  type CreateTypeFormValues,
} from "@acme/api/src/schemas/extraSchema";
import {
  updateProductFormSchema,
  type UpdateProductFormValues,
} from "@acme/api/src/schemas/productSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import ProductsTable from "~/components/ProductsTable";
import Editor from "~/components/editor/Editor";
import FormSteps from "~/components/forms/elements/FormSteps";
import ImageFormElement from "~/components/forms/elements/ImageFormElement";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ComboboxElement from "../elements/ComboboxElement";
import GifFormElement from "../elements/GifFormElement";
import ImageExtraFormElement from "../elements/ImageExtraFormElement";
import InputLoopElement from "../elements/InputLoopElement";
import NumberFormElement from "../elements/NumberFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import PdfFormElement from "../elements/PdfFormElement";
import PriceFormController from "../elements/PriceFormController";
import SelectFormElement from "../elements/SelectFormElement";
import SelectFormElementLoop from "../elements/SelectFormElementLoop";
import SideFormElement from "../elements/SideFormElement";
import TagsElement from "../elements/TagsFormElement";
import { SeoSection } from "../seo/SeoSection";
import OrdenImagen from "./components/OrdenImagen";

type Attributes = {
  name?: string;
  value?: string | number;
  type?: string;
  unit?: string;
};

type MyProducer = Producer & {
  logo: Image | null;
  product: (ProducerOfProduct & {
    product: Product & {
      Category?: Category[];
    };
    producer: Producer & {
      product: (ProducerOfProduct & {
        product: Product & {
          Category?: Category[];
        };
      })[];
    };
  })[];
};

interface MyProduct {
  product:
    | (Product & {
        Category: Category[] | null;
        complements: ProductComplement[] | null;
        relations: ProductRelation[] | null;
        parts: ProductParts[] | null;
        producer?: (ProducerOfProduct & {
          product?: Product;
          producer?: (MyProducer | undefined)[];
        })[];
        ImagesExtra: (ImagesExtra & { image: Image })[];
        Gif: Gif | null;
        brochure: Pdf | null;
        manual: Pdf | null;
        image: Image;
        seo: Seo & {
          openGraphBasicImage?: Image | null;
        };
      })
    | null
    | undefined;
  paso: string | string[] | undefined;
  seoSec: string | string[] | undefined;
  category:
    | {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        characteristics: Prisma.JsonValue;
        parent: Category | null;
        child: Category[];
        imageId: string | null;
        image: Image | null;
      }[]
    | undefined;
  misCat: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    characteristics: Prisma.JsonValue;
    parent: Category | null;
    child: Category[];
    imageId: string | null;
    image: Image | null;
  }[];
  producerData:
    | (Producer & {
        product: (ProducerOfProduct & {
          product: Product & {
            image: Image;
            Category: (Category & {
              parent: Category | null;
              child: Category[];
            })[];
          };
        })[];
        logo: Image | null;
      })[]
    | undefined;
  unit:
    | {
        id: string;
        name: string;
      }[]
    | undefined;
  type:
    | {
        id: string;
        name: string;
      }[]
    | undefined;
  sortedProducts:
    | (ImagesExtra & {
        image: Image;
      })[]
    | undefined;
}
interface MyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  characteristics: Prisma.JsonValue;
  parent: Category | null;
  child: Category[];
  imageId: string | null;
  image: Image | null;
}

export default function EditProductForm({
  product,
  paso,
  seoSec,
  category,
  misCat,
  type,
  unit,
  sortedProducts,
  producerData,
}: MyProduct) {
  const { data: session } = useSession({ required: true });
  const updateSlug = hasPermission(session, "update_product_slug");
  const canDeleteTipo = hasPermission(session, "delete_type");
  const canDeleteUnidad = hasPermission(session, "delete_unit");
  const assignProducer = hasPermission(session, "assign_producer");

  const utils = trpc.useContext();
  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutateAsync: imageUpdater } = trpc.image.update.useMutation();
  const { mutate: deleteImg } = trpc.image.delete.useMutation();
  const { mutateAsync: gifMutator, isLoading: subiendoGif } =
    trpc.gif.create.useMutation();
  const { mutateAsync: gifUpdater } = trpc.gif.update.useMutation();
  const { mutate: deleteGif } = trpc.gif.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El gif ha sido borrado!",
        icon: "success",
      });
    },
  });
  const { mutateAsync: brochureMutator, isLoading: subiendoBrochure } =
    trpc.pdf.create.useMutation();
  const { mutate: deleteBrochure } = trpc.pdf.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La ficha técnica ha sido borrada!",
        icon: "success",
      });
    },
  });
  const { mutateAsync: manualMutator, isLoading: subiendoManual } =
    trpc.pdf.create.useMutation();
  const { mutate: deleteManual } = trpc.pdf.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El manual ha sido borrado!",
        icon: "success",
      });
    },
  });
  const { mutate: updateProduct, isLoading: subiendoProduct } =
    trpc.product.update.useMutation({
      async onSuccess() {
        imageRef.current?.reset();
        await utils.product?.show.invalidate({
          slug: product?.slug || "",
        });
        await Toast.fire({
          title: "El producto ha sido actualizado!",
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
        title: "El tipo ha sido borrado!",
        icon: "success",
      });
      await utils.type.all.invalidate();
    },
  });
  const { mutate: deleteUnidad } = trpc.unit.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La unidad ha sido borrada!",
        icon: "success",
      });
      await utils.unit.all.invalidate();
    },
  });
  const complementsId =
    product && product.complements
      ? product.complements.map(({ complementId }) => complementId)
      : [""];
  const relationsId =
    product && product.relations
      ? product.relations.map(({ relationId }) => relationId)
      : [""];
  const partsId =
    product && product.parts ? product.parts.map((p) => p.partsId) : [""];
  const [complementArray, setComplementArray] =
    useState<Array<string>>(complementsId);
  const [relationArray, setRelationArray] =
    useState<Array<string>>(relationsId);
  const [partsArray, setPartsArray] = useState<Array<string>>(partsId);
  const [categorys, setCategorys] = useState<MyCategory[]>(misCat);
  const [openTipo, setOpenTipo] = useState(false);
  const [openUnidad, setOpenUnidad] = useState(false);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [altGif, setAltGif] = useState<string | null>();
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [baseOpImage, setBaseOpImage] = useState<string>();
  const [fileOpName, setFileOpName] = useState<string>();
  const [altOpImage, setAltOpImage] = useState<string | null>();
  const [imageOpError, setImageOpError] = useState<string | undefined>(
    undefined,
  );
  const [baseGif, setBaseGif] = useState<string>();
  const [gifName, setGifName] = useState<string>();
  const [gifError, setGifError] = useState<string | undefined>(undefined);
  const [baseBrochure, setBaseBrochure] = useState<string>();
  const [nameBrochure, setNameBrochure] = useState<string>();
  const [brochureError, setBrochureError] = useState<string | undefined>(
    undefined,
  );
  const [baseManual, setBaseManual] = useState<string>();
  const [nameManual, setNameManual] = useState<string>();
  const [manualError, setManualError] = useState<string | undefined>(undefined);
  const [arr, setArr] = useState(sortedProducts);
  const [pasoCompra, setPasoCompra] = useState(paso ? paso : "1");
  const [imagesExtra1, setImagesExtra1] = useState<string | undefined>("");
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [myCategory, setMyCategory] = useState<any>(
    product?.Category &&
      product.Category.find((cat: Category) => cat.parentId === null),
  );

  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const imageOpRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const gifRef = useRef<ElementRef<typeof GifFormElement>>(null);
  const brochureRef = useRef<ElementRef<typeof PdfFormElement>>(null);
  const manualRef = useRef<ElementRef<typeof PdfFormElement>>(null);

  const size: Size = {
    width: undefined,
    height: undefined,
  };
  const imagesId = product?.ImagesExtra.map((image) => image.imageId);

  useEffect(() => {
    setArr(sortedProducts);
  }, [sortedProducts]);
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
    if (baseOpImage) {
      setImageOpError(undefined);
    }
    if (baseGif) {
      setGifError(undefined);
    }
    if (baseBrochure) {
      setBrochureError(undefined);
    }
    if (baseManual) {
      setManualError(undefined);
    }
  }, [base64Image, baseOpImage, baseGif, baseBrochure, baseManual]);

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
  console.log(product?.producer, "product?.producer");
  const {
    register,
    control,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductFormSchema),
    defaultValues: {
      name: product?.name,
      slug: product?.slug,
      // @ts-expect-error TODO: fix this
      producer: product?.producer?.map((p) => {
        return { producer: p.producer, price: p.price, delivery: p.delivery };
      }),
      brand: product?.brand,
      tags: product?.tags,
      price: product?.price,
      SKU: product?.SKU || undefined,
      description: product?.description || undefined,
      shortDescription: product?.shortDescription || undefined,
      stock: product?.stock || undefined,
      stockWarn: product?.stockWarn || undefined,
      height: product?.height || undefined,
      width: product?.width || undefined,
      length: product?.length || undefined,
      weight: product?.weight || undefined,
      type: product?.type || undefined,
      unit: product?.unit || undefined,
      barcode: product?.barcode || undefined,
      suggestedPrice: product?.suggestedPrice || undefined,
      seo: {
        ...(product?.seo || undefined),
        openGraphBasicImageId: product?.seo.openGraphBasicImageId || undefined,
      },
    },
  });
  console.log(product?.producer, "product?.producer");
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

  const steps = [
    {
      id: "Información del producto",
      paso: "1",
      status: pasoCompra === "1" ? "current" : "complete",
      error:
        errors.name ||
        errors.description ||
        errors.shortDescription ||
        errors.price ||
        errors.brand ||
        errors.SKU ||
        errors.barcode ||
        errors.suggestedPrice ||
        errors.stock ||
        errors.stockWarn ||
        errors.unit ||
        errors.type ||
        errors.tags ||
        brochureError ||
        manualError
          ? true
          : false,
    },
    {
      id: "Productos Complementarios",
      paso: "4",
      status: pasoCompra === "4" ? "current" : "complete",
    },
    {
      id: "Productos Relacionados",
      paso: "5",
      status: pasoCompra === "5" ? "current" : "complete",
    },
    {
      id: "Partes seleccionables",
      paso: "6",
      status: pasoCompra === "6" ? "current" : "complete",
    },
    {
      id: "SEO",
      paso: "7",
      status: pasoCompra === "7" ? "current" : "upcoming",
      error: errors.seo ? true : false,
    },
  ];
  /**
   * When form is submitted, updates role based on passed data.
   *
   * @param {UpdateProductFormValues} data
   */
  async function submitForm(data: UpdateProductFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/product/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));
    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientas se subía la image");
      return;
    }
    if (product?.image && imageResponse) {
      deleteImg({
        id: product.image.id,
        path: product.image.path,
        original: product.image.original,
        webp: product.image.webp,
      });
    }

    if (product) {
      const { id, alt, ...imageData } = product.image;

      if (product.image && product.image.id) {
        await imageUpdater({
          id: product.image.id,
          alt: altImage,
          ...imageData,
        });
      }
    }
    const gifResponse =
      baseGif &&
      (await gifMutator({
        path: "images/product/gif",
        image: baseGif,
        size,
        alt: altGif,
        name: gifName,
      }));
    if (baseGif && gifResponse === undefined) {
      setGifError("Algo salió mal mientas se subía el gif");
      return;
    }
    if (product?.Gif && gifResponse) {
      deleteGif({
        id: product.Gif.id,
        path: product.Gif.path,
        original: product.Gif.original,
      });
    }

    if (product && product.Gif) {
      const { id, alt, ...gifData } = product.Gif;

      if (product.Gif && product.Gif.id) {
        await gifUpdater({
          id: product.Gif.id,
          alt: altGif,
          ...gifData,
        });
      }
    }

    if (imageArray.length !== 0) {
      const imageArrayResponse = await Promise.all(
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

      updateProduct({
        id: product?.id || "",
        ...data,
        user: session?.user?.id,

        imagesExtra: imageArrayResponse.map(
          (res: Image | undefined | null): string => {
            return res ? res.id : "";
          },
        ),
      });
    }
    const imageOpResponse =
      baseOpImage &&
      (await imageMutator({
        path: "images/product/openGraphBasicImage",
        image: baseOpImage,
        size: size,
        alt: altOpImage,
        name: fileOpName,
      }));
    if (baseOpImage && imageOpResponse === undefined) {
      setImageOpError("Algo salió mal mientas se subía la image");
      return;
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
      }

      if (product?.brochure) {
        deleteBrochure({
          id: product.brochure.id,
          path: product.brochure.path,
          original: product.brochure.original,
        });
      }

      updateProduct({
        id: product?.id || "",
        brochureId: brochureResponse?.id,
        user: session?.user?.id,
        ...data,
      });
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
      }

      if (product?.manual) {
        deleteManual({
          id: product.manual.id,
          path: product.manual.path,
          original: product.manual.original,
        });
      }

      updateProduct({
        id: product?.id || "",
        manualId: manualResponse?.id,
        user: session?.user?.id,
        ...data,
      });
    }

    updateProduct({
      id: product?.id || "",
      ...data,
      imageId: imageResponse ? imageResponse.id : undefined,
      gifId: gifResponse && gifResponse.id,
      idImagesAd: imagesId,
      arrayImages: arr?.map((arr: ImagesExtra) => arr.imageId),
      category: categorys?.map((cat) => cat.id),
      user: session?.user?.id,
      producerCategories:
        product && product.producer
          ? // @ts-expect-error TODO: fix this
            categoriesNames(product.producer.map((p) => p.producer))
          : undefined,
      complement: complementArray,
      relation: relationArray,
      parts: partsArray,
      seo: {
        ...data.seo,
        openGraphBasicImageId: imageOpResponse ? imageOpResponse.id : undefined,
      },
    });
  }
  /**
   * When form is submitted, creates new type based on passed data.
   *
   * @param {CreateTypeFormValues} data
   */
  function submitFormType(data: CreateTypeFormValues) {
    crearTipo({
      ...data,
    });
  }

  /**
   * When form is submitted, creates new unit based on passed data.
   *
   * @param {CreatUnitFormValues} data
   */
  function submitFormUnit(data: CreatUnitFormValues) {
    crearUnidad({
      ...data,
    });
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof UpdateProductFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof UpdateProductFormValues) {
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
        setMyCategory(value);
        setCategorys([value]);
        resetField("Subcategory1");
      } else if (categorys.map((cat) => cat.id).includes(value.id)) {
        return;
      } else if (categorys.some((cat) => cat.parentId === value.parentId)) {
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
        setCategorys((categorys) => [...categorys, value]);
      } else {
        setCategorys((categorys) => [...categorys, value]);
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
    for (let i = 0; i < cantidad; i++) {
      td.push(
        <SelectFormElementLoop
          // @ts-expect-error TODO: fix this
          control={control}
          name={`Subcategory${i + 1}`}
          label={`Subcategoría ${i + 1}`}
          data={categorys[i]?.child}
          setMiCategory={myCategories}
          shouldUnregister={true}
          defaultValue={categorys[i + 1]}
          key={i}
          className="-mb-6 sm:col-span-4"
        />,
      );
    }
    return td;
  }

  /**
   * Gets all parent categories of products connected to producer.
   *
   */
  function categoriesNames(producer: MyProducer[] | undefined) {
    const res = producer
      ?.map((producer) =>
        producer?.product
          .map((p) => p.product.Category?.find((cat) => cat.parentId === null))
          .map((category) => category?.name),
      )[0]
      ?.filter(Boolean);

    return res ?? undefined;
  }

  /**
   * Connects product to the complementary products.
   *
   * @param {string} productId
   */
  function handleAdd(productId: string) {
    if (productId !== product?.id) {
      setComplementArray([...(complementArray || []), productId]);
      submitForm;
    } else {
      return;
    }
  }

  /**
   * Deletes connection of product to the complementary products.
   *
   * @param {string} productId
   */
  function handleRemove(productId: string) {
    const newArray = complementsId?.filter((id) => id !== productId);
    setComplementArray(newArray);
  }

  /**
   * Connects product to the parts products.
   *
   * @param {string} productId
   */
  function handleAddPart(productId: string) {
    if (productId !== product?.id) {
      setPartsArray([...(partsArray || []), productId]);
      submitForm;
    } else {
      return;
    }
  }

  /**
   * Deletes connection of product to the parts products.
   *
   * @param {string} productId
   */
  function handleRemovePart(productId: string) {
    const newArray = partsId?.filter((id) => id !== productId);
    setPartsArray(newArray);
  }

  /**
   * Connects product to the relational products.
   *
   * @param {string} productId
   */
  function handleAddRelation(productId: string) {
    if (productId !== product?.id) {
      setRelationArray([...(relationArray || []), productId]);
      submitForm;
    } else {
      return;
    }
  }

  /**
   * Deletes connection of product to the relational products.
   *
   * @param {string} productId
   */
  function handleRemoveRelation(productId: string) {
    const newArray = relationsId?.filter((id) => id !== productId);
    setRelationArray(newArray);
  }

  const myCharacteristics = product?.Category?.map(
    (cat) => cat.characteristics,
  );

  /**
   * Filters duplicated characteristics comparing same name values and removes null values.
   *
   * @param arr
   * @returns
   */
  function get1DArray(arr: Attributes[] | undefined) {
    const result: Attributes[] = [];
    if (arr) {
      for (let x = 0; x < arr.length; x++) {
        for (let y = 0; y < (arr[x] as Attributes[])?.length; y++) {
          if ((arr[x] as Attributes[])[y] !== null) {
            result.push((arr[x] as Attributes[])[y] as Attributes);
          }
        }
      }
    }
    const unique = result.filter((obj: Attributes, index) => {
      return (
        index === result.findIndex((o: Attributes) => obj?.name === o?.name)
      );
    });
    return unique;
  }

  const { fields, remove, append } = useFieldArray({
    name: "producer",
    control,
  });

  return (
    <>
      {/* <h1 className="mb-5 mt-[-18px]">
        Producto: <strong>{product?.name}</strong>
      </h1> */}
      <FormSteps steps={steps} setPasoCompra={setPasoCompra} />
      <form id="form1" onSubmit={handleSubmit(submitForm)}>
        {pasoCompra === "1" ? (
          <div>
            <div className="space-y-12">
              <div className="-10 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12  dark:border-gray-400 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                    Producto
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Información principal del producto.
                  </p>
                </div>

                <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
                  <TextFormElement
                    label="Nombre"
                    {...register("name")}
                    error={getError("name")}
                    className="-mb-6 sm:col-span-3"
                  />
                  {updateSlug.status && (
                    <TextFormElement
                      {...register("slug")}
                      error={getError("slug")}
                      dangerous={true}
                      className="-mb-6 sm:col-span-3"
                    />
                  )}
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
                    label="Categoría"
                    // error={getError('Category')}
                    data={category && categoryStructure(category)}
                    // miCategory={miCategory}
                    setMiCategory={myCategories}
                    defaultValue={myCategory}
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
                    className="col-span-full -mb-10"
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
                    label="Unidad"
                    name="unit"
                    error={getError("unit")}
                    data={unit}
                    deleteFunction={deleteExtraHandler}
                    openCreate={setOpenUnidad}
                    canDelete={canDeleteTipo.status}
                    className="-mb-6 sm:col-span-3"
                  />
                  <SelectFormElement
                    // @ts-expect-error TODO: fix this
                    control={control}
                    label="Tipo"
                    name="type"
                    error={getError("type")}
                    data={type}
                    deleteFunction={deleteExtraHandler}
                    openCreate={setOpenTipo}
                    canDelete={canDeleteUnidad.status}
                    className="-mb-6 sm:col-span-3"
                  />
                  <TagsElement
                    // @ts-expect-error TODO: fix this
                    control={control}
                    name="tags"
                    error={getError("tags")}
                    defaultValue={product?.tags}
                    className="-mb-6 sm:col-span-4"
                  />
                  <PdfFormElement
                    name="Ficha Técnica"
                    error={brochureError}
                    pdf={baseBrochure}
                    setPdf={setBaseBrochure}
                    ref={brochureRef}
                    defaultPdf={product?.brochure}
                    deletePdf={deleteBrochure}
                    setFileName={setNameBrochure}
                    className="col-span-3"
                  />
                  <PdfFormElement
                    name="Manual"
                    error={manualError}
                    pdf={baseManual}
                    setPdf={setBaseManual}
                    ref={manualRef}
                    defaultPdf={product?.manual}
                    deletePdf={deleteManual}
                    setFileName={setNameManual}
                    className="col-span-3"
                  />
                  <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 dark:border-gray-400 sm:col-span-full sm:px-8">
                    {product && (
                      <LinkElement
                        href={`/admin/producto/${product.slug}`}
                        intent="primary"
                        size="sm"
                        className="mr-2"
                      >
                        Volver
                      </LinkElement>
                    )}
                    {!subiendoProduct &&
                      !subiendoGif &&
                      !subiendoBrochure &&
                      !subiendoManual &&
                      !subiendoImg && (
                        <ButtonElement
                          form="form1"
                          type="submit"
                          intent="primary"
                        >
                          Actualizar
                        </ButtonElement>
                      )}
                    {(subiendoProduct ||
                      subiendoBrochure ||
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
                    )}
                  </div>
                </div>
              </div>
              {assignProducer && (
                <div className="-10 mt-5 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12  dark:border-gray-400 md:grid-cols-3">
                  <div>
                    <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                      Fabricante
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      Información del fabricante del producto.
                    </p>
                  </div>

                  <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2 md:grid-cols-11">
                    {assignProducer &&
                      producerData &&
                      fields.map((field, index) => {
                        console.log(producerData, "field");
                        return (
                          <>
                            {/* <div className="grid gap-6 md:grid-cols-7" key={field.id}> */}
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
                    <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 dark:border-gray-400 sm:col-span-full sm:px-8">
                      {product && (
                        <LinkElement
                          href={`/admin/producto/${product.slug}`}
                          intent="primary"
                          size="sm"
                          className="mr-2"
                        >
                          Volver
                        </LinkElement>
                      )}
                      {!subiendoProduct &&
                        !subiendoGif &&
                        !subiendoBrochure &&
                        !subiendoManual &&
                        !subiendoImg && (
                          <ButtonElement
                            form="form1"
                            type="submit"
                            intent="primary"
                          >
                            Actualizar
                          </ButtonElement>
                        )}
                      {(subiendoProduct ||
                        subiendoBrochure ||
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
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="-10 mt-5 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12  dark:border-gray-400 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                    Características
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Datos de las características del producto.
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
                  {/* <div> */}
                  <InputLoopElement
                    // @ts-expect-error TODO: fix this
                    control={control}
                    label="Atributos"
                    name="attributes"
                    optional
                    characteristics={get1DArray(
                      myCharacteristics as Attributes[],
                    )}
                    defaultAttributes={product?.attributes}
                    error={getError("attributes")}
                    className="-mb-6 sm:col-span-4"
                  />
                  {/* </div> */}
                  <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 dark:border-gray-400 sm:col-span-full sm:px-8">
                    {product && (
                      <LinkElement
                        href={`/admin/producto/${product.slug}`}
                        intent="primary"
                        size="sm"
                        className="mr-2"
                      >
                        Volver
                      </LinkElement>
                    )}
                    {!subiendoProduct &&
                      !subiendoGif &&
                      !subiendoBrochure &&
                      !subiendoManual &&
                      !subiendoImg && (
                        <ButtonElement
                          form="form1"
                          type="submit"
                          intent="primary"
                        >
                          Actualizar
                        </ButtonElement>
                      )}
                    {(subiendoProduct ||
                      subiendoBrochure ||
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
                    )}
                  </div>
                </div>
              </div>
              <div className="-10 mt-5 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12  dark:border-gray-400 md:grid-cols-3">
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
                      defaultImage={product?.image}
                      altImage={altImage}
                      setAltImage={setAltImage}
                      setFileName={setFileName}
                    />
                  </div>
                  <div className="col-span-full">
                    <GifFormElement
                      name="Gif producto"
                      error={gifError}
                      image={baseGif}
                      setImage={setBaseGif}
                      ref={gifRef}
                      defaultGif={product?.Gif}
                      deleteGif={deleteGif}
                      altGif={altGif}
                      setAltGif={setAltGif}
                      setFileName={setGifName}
                    />
                  </div>
                  <div className="col-span-full">
                    <ImageExtraFormElement
                      name="imágenes adicionales"
                      error={imageError}
                      size={size}
                      setImage={defineImage}
                      ref={imageRef}
                      submitForm={submitForm}
                      imageArray={imageArray}
                      setImageArray={setImageArray}
                      setImagesExtra1={setImagesExtra1}
                    />
                    {product?.ImagesExtra.length !== 0 ? (
                      <OrdenImagen arr={arr} setArr={setArr} />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 dark:border-gray-400 sm:col-span-full sm:px-8">
                    {product && (
                      <LinkElement
                        href={`/admin/producto/${product.slug}`}
                        intent="primary"
                        size="sm"
                        className="mr-2"
                      >
                        Volver
                      </LinkElement>
                    )}
                    {!subiendoProduct &&
                      !subiendoGif &&
                      !subiendoBrochure &&
                      !subiendoManual &&
                      !subiendoImg && (
                        <ButtonElement
                          form="form1"
                          type="submit"
                          intent="primary"
                        >
                          Actualizar
                        </ButtonElement>
                      )}
                    {(subiendoProduct ||
                      subiendoBrochure ||
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : pasoCompra === "4" ? (
          <div className="mb-10">
            <div className="space-y-12">
              <div className="-10 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                    Productos Complementarios
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Seleccione todos los productos que complementen al producto.
                  </p>
                </div>

                <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
                  <div className="sm:col-span-full">
                    <ProductsTable
                      handleRemove={handleRemove}
                      handleAdd={handleAdd}
                      AddFunc
                      idArray={complementArray}
                      stateTd={false}
                      approveTd={false}
                      priceTd={false}
                      producerTd={false}
                      sortedAdded
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              {product && (
                <LinkElement
                  href={`/admin/producto/${product.slug}`}
                  intent="primary"
                  size="sm"
                  className="mr-2"
                >
                  Volver
                </LinkElement>
              )}
              {!subiendoProduct &&
                !subiendoGif &&
                !subiendoBrochure &&
                !subiendoManual &&
                !subiendoImg && (
                  <ButtonElement form="form1" type="submit" intent="primary">
                    Actualizar
                  </ButtonElement>
                )}
              {(subiendoProduct ||
                subiendoBrochure ||
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
              )}
            </div>
          </div>
        ) : pasoCompra === "5" ? (
          <div className="mb-10">
            <div className="space-y-12">
              <div className="-10 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                    Productos Relacionados
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Seleccione todos los productos que se relacionen con el
                    producto.
                  </p>
                </div>

                <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
                  <div className="sm:col-span-full">
                    <ProductsTable
                      handleRemove={handleRemoveRelation}
                      handleAdd={handleAddRelation}
                      AddFunc
                      idArray={relationArray}
                      stateTd={false}
                      approveTd={false}
                      priceTd={false}
                      producerTd={false}
                      sortedAdded
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              {product && (
                <LinkElement
                  href={`/admin/producto/${product.slug}`}
                  intent="primary"
                  size="sm"
                  className="mr-2"
                >
                  Volver
                </LinkElement>
              )}
              {!subiendoProduct &&
                !subiendoGif &&
                !subiendoBrochure &&
                !subiendoManual &&
                !subiendoImg && (
                  <ButtonElement form="form1" type="submit" intent="primary">
                    Actualizar
                  </ButtonElement>
                )}
              {(subiendoProduct ||
                subiendoBrochure ||
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
              )}
            </div>
          </div>
        ) : pasoCompra === "6" ? (
          <div className="mb-10">
            <div className="space-y-12">
              <div className="-10 grid grid-cols-1 gap-x-8 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-50">
                    Partes Seleccionables
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Elija las partes que se deberan o podrán comprar con el
                    producto.
                  </p>
                </div>

                <div className="grid max-w-2xl grid-cols-1 gap-x-6  sm:grid-cols-6 md:col-span-2">
                  <div className="sm:col-span-full">
                    <ProductsTable
                      handleRemove={handleRemovePart}
                      handleAdd={handleAddPart}
                      AddFunc
                      idArray={partsArray}
                      stateTd={false}
                      approveTd={false}
                      priceTd={false}
                      producerTd={false}
                      sortedAdded
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              {product && (
                <LinkElement
                  href={`/admin/producto/${product.slug}`}
                  intent="primary"
                  size="sm"
                  className="mr-2"
                >
                  Volver
                </LinkElement>
              )}
              {!subiendoProduct &&
                !subiendoGif &&
                !subiendoBrochure &&
                !subiendoManual &&
                !subiendoImg && (
                  <ButtonElement form="form1" type="submit" intent="primary">
                    Actualizar
                  </ButtonElement>
                )}
              {(subiendoProduct ||
                subiendoBrochure ||
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
              )}
            </div>
          </div>
        ) : (
          <div>
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
          </div>
        )}
        {pasoCompra === "7" && (
          <div>
            {product && (
              <LinkElement
                href={`/admin/producto/${product.slug}`}
                intent="primary"
                size="sm"
                className="mr-2"
              >
                Volver
              </LinkElement>
            )}
            {!subiendoProduct &&
              !subiendoGif &&
              !subiendoBrochure &&
              !subiendoManual &&
              !subiendoImg && (
                <ButtonElement form="form1" type="submit" intent="primary">
                  Actualizar
                </ButtonElement>
              )}
            {(subiendoProduct ||
              subiendoBrochure ||
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
            )}
          </div>
        )}
      </form>
      <SideFormElement show={openTipo} onClose={setOpenTipo}>
        <h1 className="mb-5 text-3xl font-extrabold dark:text-white">
          Crear Tipo
        </h1>
        <form id="form2" onSubmit={subirTipo(submitFormType)}>
          <TextFormElement
            label="label"
            {...registroTipo("name")}
            error={getErrorType("name")}
          />
          <ButtonElement form="form2" type="submit" intent="primary">
            Crear
          </ButtonElement>
        </form>
      </SideFormElement>
      <SideFormElement show={openUnidad} onClose={setOpenUnidad}>
        <h1 className="mb-5 text-3xl font-extrabold dark:text-white">
          Crear Unidad
        </h1>
        <form id="form3" onSubmit={subirUnidad(submitFormUnit)}>
          <TextFormElement
            label="label"
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
