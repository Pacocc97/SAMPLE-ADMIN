import { useEffect, useRef, useState, type ElementRef } from "react";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  BlogCategory,
  Category,
  Image,
  Prisma,
  Seo,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  updateCategoryBlogFormSchema,
  type UpdateCategoryBlogFormValues,
} from "@acme/api/src/schemas/categoryBlogSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
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

export interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
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

type ErrorType = {
  message: string;
  // Other properties if needed
};

export default function EditBlogCategoryForm({
  blogCategory,
}: {
  blogCategory: Category & {
    image?: Image;
    seo: Seo & {
      openGraphBasicImage?: Image | null;
    };
  };
}) {
  const router = useRouter();
  const { paso, seoSec } = router.query;
  const utils = trpc.useContext();
  const categories = trpc.blogCategory.all.useQuery();
  const categoryOptions = categories.data?.map((blogCategory) => ({
    id: blogCategory.id,
    name: blogCategory.name,
    slug: blogCategory.slug,
    characteristics: null,
    description: blogCategory.description,
    parentId: blogCategory.parentId,
    parent: blogCategory.parent,
    child: blogCategory.child,
    imageId: blogCategory.imageId,
    image: blogCategory.image,
  }));
  console.log(categories, "categoryOptions");
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

  const { mutate: updateCategory, isLoading: subiendoCategory } =
    trpc.blogCategory.update.useMutation({
      async onSuccess() {
        await utils.blogCategory.all.invalidate();
        await Toast.fire({
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
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCategoryBlogFormValues>({
    resolver: zodResolver(updateCategoryBlogFormSchema),
    defaultValues: {
      name: blogCategory?.name || undefined,
      slug: blogCategory?.slug || undefined,
      description: blogCategory?.description || undefined,
      seo: {
        ...(blogCategory?.seo || undefined),
        openGraphBasicImageId:
          blogCategory?.seo.openGraphBasicImageId || undefined,
      },
    },
  });

  const steps = [
    {
      id: "Información de la categoría",
      paso: "1",
      status: pasoCompra === "1" ? "current" : "complete",
      error: errors.name || errors.description ? true : false,
    },
    {
      id: "SEO",
      paso: "3",
      status: pasoCompra === "3" ? "current" : "complete",
      error: errors.seo ? true : false,
    },
  ];

  /**
   * Returns watch. Shows data of each input.
   *
   * @param value
   * @returns
   */

  /**
   * When form is submitted, updates categoría based on passed data.
   *
   * @param {UpdateCategoryBlogFormValues} data
   */
  async function submitForm(data: UpdateCategoryBlogFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/blogCategory/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));

    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }

    if (blogCategory?.image && imageResponse) {
      deleteImg({
        id: blogCategory.image.id,
        path: blogCategory.image.path,
        original: blogCategory.image.original,
        webp: blogCategory.image.webp,
      });
    }

    const imageOpResponse =
      baseOpImage &&
      (await imageMutator({
        path: "images/blogCategory/image/openGraphBasicImage",
        image: baseOpImage,
        size: size,
        alt: altOpImage,
        name: fileOpName,
      }));

    if (baseOpImage && imageOpResponse === undefined) {
      setImageOpError("Algo salió mal mientas se subía la imagen");
      return;
    }

    if (blogCategory?.seo.openGraphBasicImage && imageOpResponse) {
      deleteImg({
        id: blogCategory.seo.openGraphBasicImage.id,
        path: blogCategory.seo.openGraphBasicImage.path,
        original: blogCategory.seo.openGraphBasicImage.original,
        webp: blogCategory.seo.openGraphBasicImage.webp,
      });
    }

    updateCategory({
      ...data,
      id: blogCategory.id,
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
   * @param {keyof UpdateCategoryBlogFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(
    field: keyof UpdateCategoryBlogFormValues,
    subField?: string,
  ) {
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
   * Generates new select inputs based on the children options of the selected blogCategory.
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
              defaultImage={blogCategory?.image}
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
                    data={
                      categoryOptions &&
                      categoryStructure(
                        categoryOptions as (BlogCategory & {
                          characteristics: null;
                          parent: Category | null;
                          child: Category[];
                          image: Image | null;
                        })[],
                      )
                    }
                    myCategory={myCategory}
                    setMiCategory={myCategories}
                    defaultValue={myCategory}
                  />
                )}
              </>
            )}
            {SubCategories()}
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
            href={`/admin/categorias_blog/${blogCategory?.slug}`}
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
