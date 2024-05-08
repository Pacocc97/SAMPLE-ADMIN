import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ElementRef,
} from "react";
import { useRouter } from "next/router";
import { Disclosure, Switch } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, ThemeProvider, createTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import type { Blog, BlogCategory, Image, Seo } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  updateBlogFormSchema,
  type UpdateBlogFormValues,
} from "@acme/api/src/schemas/blogSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import { classNames } from "~/utils/object";
import Editor from "~/components/editor/Editor";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import type { Size } from "~/types/types";
import FormSteps from "../elements/FormSteps";
import ImageFormElement from "../elements/ImageFormElement";
import ParagraphFormElement from "../elements/ParagraphFormElement";
import SearchElement from "../elements/SearchElement";
import SideFormElement from "../elements/SideFormElement";
import TagsElement from "../elements/TagsFormElement";
import ToggleFormElement from "../elements/ToggleFormElement";
import { SeoSection } from "../seo/SeoSection";

interface CustomBlog {
  blog: Blog & {
    image: Image | null;
    BlogCategory: BlogCategory[];
    seo: Seo & {
      openGraphBasicImage?: Image | null;
    };
  };
}

interface MyCategory {
  id: string;
  name: string;
  parentId: string | null;
  child: BlogCategory[];
  parent: BlogCategory;
  description: string | null;
  slug: string;
  imageId: string;
  image: Image;
}

interface WholeCategory extends BlogCategory {
  parent: WholeCategory | null;
  child: WholeCategory[] | null;
  image: Image | null;
}

type MuiEvent = {
  $d: Date;
};

export default function EditBlogForm({ blog }: CustomBlog) {
  const router = useRouter();
  const { paso, seoSec } = router.query;
  const { data: session } = useSession({ required: true });
  const updateSlug = hasPermission(session, "update_blog_slug");

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

  const { mutateAsync: imageMutator, isLoading: subiendoImg } =
    trpc.image.create.useMutation();
  const { mutate: deleteImg } = trpc.image.delete.useMutation();

  const [categories, setCategories] = useState(blog.BlogCategory);
  const [base64Image, setBase64Image] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [altImage, setAltImage] = useState<string | null>();
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [baseOpImage, setBaseOpImage] = useState<string>();
  const [fileOpName, setFileOpName] = useState<string>();
  const [altOpImage, setAltOpImage] = useState<string | null>();
  const [imageOpError, setImageOpError] = useState<string | undefined>();
  const [stepForm, setStepForm] = useState(paso ? paso : "1");
  const [dateTime, setDateTime] = useState<Date>();
  const [enabled, setEnabled] = useState(blog.draft);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const imageOpRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const imageRef = useRef<ElementRef<typeof ImageFormElement>>(null);
  const size: Size = {
    width: undefined,
    height: undefined,
  };
  const { mutate: updateBlog, isLoading: subiendoBlog } =
    trpc.blog.update.useMutation({
      async onSuccess() {
        await utils.blog?.show.invalidate({
          slug: blog?.slug || "",
        });
        await utils.blog.all.invalidate();
        void Toast.fire({
          title: "El blog ha sido editado",
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
  const categoryDefault = categories.map((cat) => cat.id);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UpdateBlogFormValues>({
    resolver: zodResolver(updateBlogFormSchema),
    defaultValues: {
      title: blog.title,
      slug: blog.slug || undefined,
      description: blog.description || undefined,
      shortDescription: blog.shortDescription || undefined,
      tags: blog.tags || undefined,
      seo: {
        ...(blog?.seo || undefined),
        openGraphBasicImageId: blog?.seo.openGraphBasicImageId || undefined,
      },
    },
  });
  /**
   * Submits form data.
   * - Checks if image was submitted properly. Deletes previous image.
   * - Connects imageId, categories and products to blog.
   *
   * @param {UpdateBlogFormValues} data
   * @returns
   */
  async function submitForm(data: UpdateBlogFormValues) {
    const imageResponse =
      base64Image &&
      (await imageMutator({
        path: "images/blog/image",
        image: base64Image,
        size,
        alt: altImage,
        name: fileName,
      }));

    if (base64Image && imageResponse === undefined) {
      setImageError("Algo salió mal mientras se subía la imagen");
      return;
    }

    if (blog?.image && imageResponse) {
      deleteImg({
        id: blog.image.id,
        path: blog.image.path,
        original: blog.image.original,
        webp: blog.image.webp,
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

    if (blog?.seo.openGraphBasicImage && imageOpResponse) {
      deleteImg({
        id: blog.seo.openGraphBasicImage.id,
        path: blog.seo.openGraphBasicImage.path,
        original: blog.seo.openGraphBasicImage.original,
        webp: blog.seo.openGraphBasicImage.webp,
      });
    }
    updateBlog({
      id: blog.id,
      draft: enabled,
      published: enabled
        ? watch().publish || blog.publishedAt
          ? true
          : false
        : null,
      publishedAt: enabled ? (watch().publish ? new Date() : dateTime) : null,
      deletedAt: !enabled ? new Date() : null,
      BlogCategory: categories?.map((cat) => cat.id),
      ...data,
      imageId: imageResponse && imageResponse.id,
      seo: {
        ...data.seo,
        openGraphBasicImageId: imageOpResponse ? imageOpResponse.id : undefined,
      },
    });
  }
  /**
   * Catch form input errors.
   *
   * @param {keyof UpdateBlogFormValues} field
   * @returns
   */
  function getError(field: keyof UpdateBlogFormValues) {
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
      // const newMap = result.map((cat) => {
      //   if (cat.parent) {
      //     return cat.parent;
      //   } else return cat;
      // });
      return result;
    }
  }

  useEffect(() => {
    if (base64Image) {
      setImageError(undefined);
    }
    if (baseOpImage) {
      setImageOpError(undefined);
    }
  }, [base64Image, baseOpImage]);

  const steps = [
    {
      id: "Información del blog",
      paso: "1",
      status: stepForm === "1" ? "current" : "complete",
      error:
        errors.title ||
        errors.shortDescription ||
        errors.description ||
        errors.tags ||
        imageError
          ? true
          : false,
    },
    {
      id: "Seo",
      paso: "2",
      status: stepForm === "2" ? "current" : "complete",
      error: errors.seo ? true : false,
    },
  ];

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
        categories?.filter((category: BlogCategory) => category.id !== cat.id),
      );
    }
  };
  const handleDatePick = (e: MuiEvent) => {
    if (!blog.publishedAt) {
      if (!watch().publish) {
        setDateTime(e.$d);
      } else {
        setDateTime(new Date());
      }
    }
  };

  const formattedDate = (value: Date) =>
    value.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const hoursAndMinutes = (value: Date) =>
    value.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const handleToggle = async (e: boolean) => {
    if (enabled) {
      await ConfirmModal.fire({
        text: "Se quitará el blog de las publicaciones",
        confirmButtonText: "Sí, seguir!",
      }).then((result) => {
        if (result.isConfirmed) {
          setEnabled(e);
        }
      });
    } else {
      await ConfirmModal.fire({
        title: "Desea publicar",
        text: "Se publicará el blog",
        confirmButtonText: "Sí, seguir!",
        cancelButtonColor: "#d33",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          setEnabled(e);
        }
      });
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
                          defaultChecked={categoryDefault.includes(category.id)}
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
  {
    console.log(blog.published);
  }
  return (
    <>
      <FormSteps steps={steps} setPasoCompra={setStepForm} />
      <form onSubmit={handleSubmit(submitForm)}>
        {stepForm === "1" ? (
          <>
            <div className="mb-5">
              <p className="mb-4">
                Estado: {blog.published ? "Publicado" : "Sin publicar"}
              </p>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                {enabled ? "Regresar a borrador" : "Publicar"}
              </label>
              <Switch
                checked={enabled}
                onChange={(e) => handleToggle(e)}
                className={classNames(
                  enabled ? "bg-indigo-600" : "bg-gray-200",
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                )}
              >
                <span className="sr-only">Use setting</span>
                <span
                  className={classNames(
                    enabled ? "translate-x-5" : "translate-x-0",
                    "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  )}
                >
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={classNames(
                      enabled
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out",
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3 w-3 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </Switch>
            </div>
            {(!blog.publishedAt || enabled) && (
              <>
                <h2 className="mb-4">
                  Publicación:{" "}
                  {watch().publish
                    ? "Será publicado en este momento"
                    : dateTime
                    ? `Será publicado el ${formattedDate(
                        dateTime,
                      )} a las ${hoursAndMinutes(dateTime)}`
                    : "Sin publicación programada"}
                </h2>
                <ToggleFormElement
                  // @ts-expect-error TODO: fix this
                  control={control}
                  label="Publicar ahora"
                  name="publish"
                  // error={getError("draft")}
                />
                <div className="pb-10">
                  <h1 className="mb-2 block rounded-lg text-sm font-medium text-gray-50 dark:text-gray-300">
                    Programar fecha de publicación
                  </h1>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      format="DD/MM/YYYY hh:mm a"
                      sx={{
                        ".MuiInputBase-input": {
                          color: "success.dark",
                          display: "inline",
                          fontWeight: "bold",
                          mx: 0.5,
                          fontSize: 14,
                          padding: "pt-[1000px]",
                          text: "red",
                        },
                      }}
                      slotProps={{
                        textField: {
                          classes: {
                            root: "inputPadding",
                          },
                        },
                        desktopPaper: {
                          classes: {
                            root: "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 border-gray-300 dark:border-gray-600",
                          },
                        },
                        field: {
                          className:
                            "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 border-gray-300 dark:border-gray-600",
                        },
                      }}
                      disabled={watch().publish}
                      disablePast
                      onChange={(e) => handleDatePick(e as MuiEvent)}
                    />
                  </LocalizationProvider>
                </div>
              </>
            )}
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
                <dd className="text-gray-500 dark:text-gray-400">
                  Ir a categorías
                </dd>
                <ArrowRightOnRectangleIcon className="ml-3 w-5" />
              </button>
            </div>
            <Editor
              // @ts-expect-error TODO: fix this
              control={control}
              name="description"
              label="Descripción"
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
              ref={imageRef}
              defaultImage={blog?.image as Image | undefined}
              altImage={altImage}
              setAltImage={setAltImage}
              setFileName={setFileName}
            />

            <SideFormElement show={open} onClose={setOpen}>
              <div className="mt-5 pt-5">
                <h1 className="mb-10 text-2xl font-semibold leading-4">
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
                                  {category.child &&
                                  category.child.length >= 1 ? (
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
                                      defaultChecked={categoryDefault.includes(
                                        category.id,
                                      )}
                                      onChange={(e) =>
                                        checkedHandler(
                                          e,
                                          category as MyCategory,
                                        )
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
          href={`/admin/blog/${blog.slug}`}
          size="sm"
          intent="primary"
          className="mr-2"
        >
          Volver
        </LinkElement>
        {!subiendoBlog && !subiendoImg && (
          <ButtonElement type="submit" intent="primary">
            Subir
          </ButtonElement>
        )}
        {(subiendoBlog || subiendoImg) && (
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
