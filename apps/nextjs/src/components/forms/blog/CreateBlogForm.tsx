import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ElementRef,
} from "react";
import { Disclosure } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  createBlogFormSchema,
  type CreateBlogFormValues,
} from "@acme/api/src/schemas/blogSchema";
import { type BlogCategory, type Category, type Image } from "@acme/db";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import { classNames } from "~/utils/object";
import Editor from "~/components/editor/Editor";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import SearchElement from "../elements/SearchElement";
import SideFormElement from "../elements/SideFormElement";
import TagsElement from "../elements/TagsFormElement";

interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
  child: Category[];
  parent: Category;
  description: string;
  slug: string;
  imageId: string;
  image: Image;
}

interface WholeCategory extends BlogCategory {
  parent: WholeCategory | null;
  child: WholeCategory[] | null;
  image: Image | null;
}

export default function CreateBlogForm() {
  const utils = trpc.useContext();
  const { data: categoryData } = trpc.blogCategory.all.useQuery();
  const categoryOptions =
    categoryData?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      parent: category.parent,
      child: category.child,
      imageId: category.imageId,
      image: category.image,
    })) || [];
  const { mutate: createBlog, isLoading: creadoBlog } =
    trpc.blog.create.useMutation({
      async onSuccess() {
        await utils.blog.all.invalidate();
        await Toast.fire({
          title: "El blog ha sido añadido",
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
  const [categories, setCategories] = useState<MyCategory[]>([]);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

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
  } = useForm<CreateBlogFormValues>({
    resolver: zodResolver(createBlogFormSchema),
  });

  /**
   * Submits form data.
   * - Checks if image was submitted properly.
   * - Connects imageId and categories to blog.
   *
   * @param {CreateBlogFormValues} data
   * @returns
   */
  async function submitForm(data: CreateBlogFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/blog/image",
        image: base64Image,
        name: fileName,
        size,
        alt: altImage,
      }));

    if (imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }
    createBlog({
      ...data,
      imageId: imageResponse ? imageResponse.id : undefined,
      BlogCategory: categories?.map((cat) => cat.id),
      draft: true,
    });
  }

  /**
   * Catch form input errors.
   *
   * @param {keyof CreateBlogFormValues} field
   * @returns
   */
  function getError(field: keyof CreateBlogFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  function searchVal() {
    if (search === "") {
      return categoryOptions;
    } else {
      const result = categoryOptions?.filter((cat) => {
        const result = cat.name.toLowerCase().includes(search.toLowerCase());
        return result;
      });

      const newMap = result.map((cat) => {
        // if (cat.parent) {
        //   return cat.parent;
        // } else return cat;

        return cat;
      });

      return result;
    }
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
  }, [base64Image]);

  const checkedHandler = (
    e: ChangeEvent<HTMLInputElement>,
    cat: MyCategory,
  ) => {
    if (e.target.checked) {
      setCategories((prev) => {
        return [cat, ...prev];
      });
    } else {
      setCategories(
        categories?.filter((category: MyCategory) => category.id !== cat.id),
      );
    }
  };
  const SubRow = (value: WholeCategory[], num: number) => {
    const numero = num * 0.1;
    return value.map((category, index) => (
      <Fragment key={index}>
        <Disclosure.Panel as={Disclosure}>
          <Disclosure defaultOpen={true}>
            {({ open }) => (
              <>
                <li
                  key={category.id}
                  // className={open ? "bg-slate-100  dark:bg-slate-600" : ""}
                >
                  <div className="w-[50%]">
                    <div
                      style={{ marginLeft: `${numero}rem` }}
                      className={classNames(
                        open && category.child && category.child?.length > 0
                          ? ""
                          : "border-b border-l",
                        "flex justify-between whitespace-nowrap  py-1 font-medium text-gray-900 hover:cursor-pointer dark:text-white",
                      )}
                    >
                      {category.child && category.child.length >= 1 ? (
                        <ChevronRightIcon
                          className={classNames(
                            open ? "rotate-90 transform" : "",
                            "w-5  transform font-bold transition-all dark:hover:text-white",
                          )}
                        />
                      ) : (
                        <span className="w-5"></span>
                      )}
                      <Disclosure.Button as="div">
                        <div>{category.name}</div>
                      </Disclosure.Button>
                      <div>
                        <input
                          id="default-checkbox"
                          type="checkbox"
                          defaultChecked={categories
                            ?.map((c) => c.id)
                            .includes(category.id)}
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          onChange={(e) => checkedHandler(e, category as any)}
                          className="ml-4 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </li>
                {category.child && (
                  <ul>
                    {SubRow(category.child as unknown as WholeCategory[], 10)}
                  </ul>
                )}
              </>
            )}
          </Disclosure>
        </Disclosure.Panel>
      </Fragment>
    ));
  };

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Título"
        {...register("title")}
        error={getError("title")}
      />
      <ParagraphFormElement
        label="Descripción corta"
        {...register("shortDescription")}
        error={getError("shortDescription")}
      />
      <div className="mb-4">
        <dt className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
          Categorías
        </dt>
        <ul className="mb-4 ml-4">
          {categories.map((c) => (
            <li key={c.id} className="list-disc text-sm">
              {c.name}
            </li>
          ))}
        </ul>
        <button
          className="mb-2 mr-4 inline-flex rounded-lg border  border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
          type="button"
          onClick={() => setOpen(true)}
        >
          <dd className="text-gray-500 dark:text-gray-400">Ir a categorías</dd>
          <ArrowRightOnRectangleIcon className="ml-3 w-5" />
        </button>
      </div>
      <Editor
        // @ts-expect-error TODO: fix this
        control={control}
        name="description"
        label="Descripción (Opcional)"
        error={getError("description")}
      />
      <TagsElement
        // @ts-expect-error TODO: fix this
        control={control}
        name="tags"
        error={getError("tags")}
      />
      <ImageFormElement
              name="Imagen"
              error={imageError}
              size={size}
              image={base64Image}
              setImage={setBase64Image}
              setFileName={setFileName}
              ref={imageRef}
              altImage={altImage}
              setAltImage={setAltImage}
      />
      <SideFormElement show={open} onClose={setOpen}>
        <div className="mt-5 pt-5">
          <h1 className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
            Categorías
          </h1>

          <SearchElement
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            value={search}
            placeholder="Buscar categorías principales"
            // disabled={products.isLoading ? true : false}
          />

          <ul className="mb-4">
            {searchVal().map((category, index) => (
              <Fragment key={index}>
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <>
                      <li key={category.id}>
                        <div className="w-[50%]">
                          <div
                            className={classNames(
                              open &&
                                category.child &&
                                category.child?.length > 0
                                ? ""
                                : "border-b",
                              "flex justify-between whitespace-nowrap  py-1 font-medium text-gray-900 hover:cursor-pointer dark:text-white",
                            )}
                          >
                            {category.child && category.child.length >= 1 ? (
                              <ChevronRightIcon
                                className={classNames(
                                  open ? "rotate-90 transform" : "",
                                  "w-3 transform font-bold transition-all dark:hover:text-white",
                                )}
                              />
                            ) : (
                              <span className="w-5"></span>
                            )}
                            <Disclosure.Button as="div">
                              <div>{category.name}</div>
                            </Disclosure.Button>
                            <div>
                              <input
                                id="default-checkbox"
                                type="checkbox"
                                defaultChecked={categories
                                  ?.map((c) => c.id)
                                  .includes(category.id)}
                                onChange={(e) =>
                                  checkedHandler(e, category as MyCategory)
                                }
                                className="ml-4 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                      {category.child && (
                        <ul>
                          {SubRow(
                            category.child as unknown as WholeCategory[],
                            10,
                          )}
                        </ul>
                      )}
                    </>
                  )}
                </Disclosure>
              </Fragment>
            ))}
          </ul>
        </div>
      </SideFormElement>
      <LinkElement
        href={`/admin/blog`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!creadoBlog && !subiendoImg && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {(creadoBlog || subiendoImg) && (
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
