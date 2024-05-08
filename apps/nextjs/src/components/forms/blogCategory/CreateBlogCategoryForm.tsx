import { useEffect, useRef, useState, type ElementRef } from "react";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Image } from "@prisma/client";
import { useForm } from "react-hook-form";

import {
  type CreateCategoryBlogFormValues,
  createCategoryBlogFormSchema,
} from "@acme/api/src/schemas/categoryBlogSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import SelectFormElementLoop from "../elements/SelectFormElementLoop";

interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
  child: Category[];
  parent: Category;
  slug: string | null;
  description: string | null;
  imageId: string | null;
  image: Image | null;
}

export default function CreateBlogCategoryForm() {
  const utils = trpc.useContext();
  const blogCategory = trpc.blogCategory.all.useQuery();
  const [myCategory, setMiCategory] = useState<MyCategory>();
  const [categories, setCategorys] = useState<MyCategory[]>();
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [checked, setChecked] = useState(false);
  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };

  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutate: createCategory, isLoading: creadoCategory } =
    trpc.blogCategory.create.useMutation({
      async onSuccess() {
        reset();
        imageRef.current?.reset();
        setChecked(false);
        await utils.blogCategory.all.invalidate();
       await Toast.fire({
          title: "La categoría ha sido creada",
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

  /**
   * Sets boolean dependig if checkbox is checked.
   * This checkbox confirms blogCategory has subcategories.
   *
   */
  const handleClick = () => setChecked(!checked);

  const categoryOptions = blogCategory.data?.map((blogCategory) => ({
    id: blogCategory.id,
    name: blogCategory.name,
    slug: blogCategory.slug,
    description: blogCategory.description,
    parentId: blogCategory.parentId,
    parent: blogCategory.parent,
    child: blogCategory.child,
    imageId: blogCategory.imageId,
    image: blogCategory.image,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateCategoryBlogFormValues>({
    resolver: zodResolver(createCategoryBlogFormSchema),
  });

  /**
   * When form is submitted, creates new blogCategory based on passed data.
   *
   * @param {CreateCategoryBlogFormValues} data
   */
  async function submitForm(data: CreateCategoryBlogFormValues) {
    if (base64Image !== undefined) {
      const imageResponse =
        base64Image &&
        (await imageMutator({
          path: "images/blogCategory/image",
          image: base64Image,
      name: fileName,
          size,
          alt: altImage,
        }));

      if (imageResponse === undefined) {
        setImageError("Algo salió mal mientras se subía la imagen");
        return;
      }
      if (checked) {
        if (myCategory) {
          createCategory({
            imageId: imageResponse ? imageResponse.id : undefined,
            parentValue: myCategory.id,
            ...data,
          });
        }
      } else {
        createCategory({
          imageId: imageResponse ? imageResponse.id : undefined,
          ...data,
        });
      }
    } else {
      if (checked) {
        if (myCategory) {
          createCategory({
            parentValue: myCategory.id,
            ...data,
          });
        }
      } else {
        createCategory({
          ...data,
        });
      }
    }
  }
  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateCategoryBlogFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof CreateCategoryBlogFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }
  // console.log(base64Image, "base64Image");
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
      } else if (categories?.some((cat) => cat.parentId === value.parentId)) {
        const valorcito = categories.find(
          (cat: MyCategory) => cat?.parentId === value.parentId,
        );
        const indexOld = categories.findIndex(
          (cat: MyCategory) => cat?.id === valorcito?.id,
        );
        if (!categories.some((cat: MyCategory) => cat.id === value.id)) {
          let arr = [];
          arr = categories.slice(0, indexOld);
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
    const cantidad = categories?.filter(
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
          data={categories?.[i]?.child}
          setMiCategory={myCategories}
        />,
      );
    }
    return td;
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
        setAltImage={setAltImage}
        altImage={altImage}
        setFileName={setFileName}
      />
      <div className="mb-6">
        <input
          onClick={handleClick}
          defaultChecked={checked}
          type="checkbox"
          id="scales"
          name="scales"
        />
        <label htmlFor="scales" className="ml-5">
          Es una subcategoría?
        </label>
      </div>
      {checked && (
        <SelectFormElementLoop
          // @ts-expect-error TODO: fix this
          control={control}
          name="Categoría"
          // error={getError('Category')}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          data={categoryOptions && categoryStructure(categoryOptions as any)}
          myCategory={myCategory}
          setMiCategory={myCategories}
        />
      )}
      {SubCategories()}
      <LinkElement
        href={`/admin/categorias_blog`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoCategory && !subiendoImg && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {(creadoCategory || subiendoImg) && (
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
