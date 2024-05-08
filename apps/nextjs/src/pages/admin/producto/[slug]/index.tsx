import { Fragment, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/20/solid";
import {
  ArrowDownRightIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  HashtagIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import parse from "html-react-parser";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";
import { type Image, type Producer, type Seo } from "@acme/db";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import SideFormElement from "~/components/forms/elements/SideFormElement";
import { useWindowWide } from "~/components/hooks/useWindowWide";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import { ImageTabs } from "~/components/productComponents/ImageTabs";
import ProductHistory from "~/components/productComponents/ProductHistory";
import ProductTable from "~/components/productComponents/ProductTable";
import Accordion from "~/components/productComponents/SEO/Accordion";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import Spinner from "~/components/ui/Spinner";
import { env } from "~/env.mjs";

interface MyHTML {
  [key: string]: string;
}

type Attributes = {
  name?: string;
  value?: string | number | { low: number; high: number };
  type?: string;
  unit?: string;
};

type SeoPassed = Seo & { openGraphBasicImage: Image };

export default function Page() {
  const router = useRouter();
  const session = useSession();
  const utils = trpc.useContext();
  const canUpdate = hasPermission(session.data, "update_product");
  const canDelete = hasPermission(session.data, "delete_product");
  const windowSize = useWindowWide(1000);
  const slug = router.query.slug as string;
  const [open, setOpen] = useState(false);
  const [productTable, setProductTable] = useState<number>(0);
  const [mouseOver, setMouseOver] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openAttributes, setOpenAttributes] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("General");
  const [currentPdf, setCurrentPDf] = useState<string>("brochure");

  const {
    data: product,
    error,
    isLoading,
    status,
  } = trpc.product?.show.useQuery({ slug });
  const { data: users } = trpc.roles?.all.useQuery();

  const { mutate: deleteProduct } = trpc.product.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El product ha sido borrado!",
        icon: "success",
      });
      await utils.product.all.invalidate();
      await router.push("/admin/producto");
    },
  });
  const discountUsers = users?.filter((rol) => rol.type === "client");
  const categories = product?.Category;
  const unitProduct =
    product && product.unit
      ? product?.unit?.slice(-1) === "s" || product?.stock === 1
        ? product?.unit
        : product?.unit + "s"
      : "";
  const sortedProducts = product?.ImagesExtra.sort((p1, p2): number => {
    if (p1.orden !== null && p2.orden !== null) {
      return p1.orden - p2.orden;
    } else {
      return 0;
    }
  });
  const tabs = [
    {
      name: "General",
      current: "General" === currentTab ? true : false,
    },
    {
      name: "Detalles",
      current: "Detalles" === currentTab ? true : false,
    },
    {
      name: "Atributos",
      current: "Atributos" === currentTab ? true : false,
    },
    {
      name: "Complementos",
      current: "Complementos" === currentTab ? true : false,
    },
    {
      name: "Relacionados",
      current: "Relacionados" === currentTab ? true : false,
    },
    {
      name: "SEO",
      current: "SEO" === currentTab ? true : false,
    },
    {
      name: "Historial",
      current: "Historial" === currentTab ? true : false,
    },
  ];

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteProductHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProduct({ id });
      }
    });
  }

  /**
   * Formats passed value as a price formatted value.
   *
   * @param {number | undefined | null} value
   * @returns {string} formatted value
   */
  function precioFormato(value: number | undefined | null): string {
    return (value ? value / 100 : 0)
      .toFixed(2)
      .toString()
      .replace(/,/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Formats passed description as a html formatted value.
   *
   * @returns {string | JSX.Element | JSX.Element[]} formatted description
   */
  function description(): string | JSX.Element | JSX.Element[] {
    const productDesc = product?.description || "{}";
    const parseDesc = JSON.parse(productDesc) as Object[];

    const htmlKey = parseDesc[1] as MyHTML;
    const myDesc = parse(String(htmlKey?.html));
    return myDesc ? myDesc : "Sin descripción";
  }

  /**
   * Formats passed number as a percentage formatted value.
   *
   * @param {number} num
   * @returns {string} num percetage format as string
   */
  function formatAsPercentage(num: number): string {
    if (num === 0) {
      return "0" + "%";
    }
    return new Intl.NumberFormat("default", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num / 10000);
  }

  const infoProduct = (
    <>
      {product && (
        <ImageTabs product={product as any} sortedProducts={sortedProducts} />
      )}
      <div className="pr-10"></div>
      <dl>
        <dt className="mb-2 text-2xl font-semibold leading-4">
          Descripción corta
        </dt>
        <dd className="mb-4 p-2">{product?.shortDescription}</dd>
      </dl>
      <dl>
        <dt className="mb-2 text-2xl font-semibold leading-4">Descripción</dt>
        <dd className="p-2">{description()}</dd>
      </dl>
    </>
  );
  const attributeTable = (
    <>
      <TableElement>
        <TableHead>
          <TableHeadCol>nombre</TableHeadCol>
          <TableHeadCol>valor</TableHeadCol>
          <TableHeadCol>unidad</TableHeadCol>
        </TableHead>
        <TableBody>
          {(product?.attributes as Attributes[])?.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="h-24 content-center bg-slate-800 text-center "
              >
                <span className="text-2xl font-bold">Sin atributos</span>
              </td>
            </tr>
          ) : (
            (product?.attributes as Attributes[])?.map(
              (a) =>
                a.value &&
                (typeof a.value === "number" || typeof a.value === "string" ? (
                  <TableRow key={a.name}>
                    <TableData className="capitalize">{a.name}</TableData>
                    <TableData>{a.value}</TableData>
                    <TableData>{a.unit && a.unit}</TableData>
                  </TableRow>
                ) : (
                  <TableRow key={a.name}>
                    <TableData className="capitalize">{a.name}</TableData>
                    <TableData>
                      <span>
                        {a.value.low} - {a.value.high}
                      </span>
                    </TableData>
                    <TableData>{a.unit && a.unit}</TableData>
                  </TableRow>
                )),
            )
          )}
        </TableBody>
      </TableElement>
    </>
  );

  if (status === "error") {
    return <div>{error.message}</div>;
  }

  const infoAdicional = (
    <div>
      <dl>
        {windowSize === true && (
          <div>
            <dt className="mb-2 font-semibold leading-4">SEO</dt>
            <button
              className="mb-2 mr-4 inline-flex rounded-lg border  border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
              type="button"
              onClick={() => setOpen(true)}
            >
              <dd className="text-gray-500 dark:text-gray-400">Ir a SEO</dd>
              <ArrowRightOnRectangleIcon className="ml-3 w-5" />
            </button>
          </div>
        )}
        {windowSize === true && (
          <div>
            <dt className="mb-2 font-semibold leading-4">Historial</dt>
            <button
              className="mb-2 mr-4 inline-flex rounded-lg border  border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
              type="button"
              onClick={() => setOpenHistorial(true)}
            >
              <dd className="text-gray-500 dark:text-gray-400">
                Ir al historial
              </dd>
              <ArrowRightOnRectangleIcon className="ml-3 w-5" />
            </button>
          </div>
        )}
        {windowSize === true && (
          <div>
            <dt className="mb-2 font-semibold leading-4">Atributos</dt>
            <button
              className="mb-2 mr-4 inline-flex rounded-lg border  border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
              type="button"
              onClick={() => setOpenAttributes(true)}
            >
              <dd className="text-gray-500 dark:text-gray-400">
                Ir a atributos
              </dd>
              <ArrowRightOnRectangleIcon className="ml-3 w-5" />
            </button>
          </div>
        )}
        <dt className="my-2 font-semibold leading-4">Precio</dt>
        <dd
          onMouseOver={() => setMouseOver(true)}
          onMouseOut={() => setMouseOver(false)}
          className="mb-5 cursor-pointer text-gray-500 dark:text-gray-400"
        >
          {" "}
          $ {precioFormato(product?.price)} {product?.currency}
        </dd>
        <div
          className={classNames(
            !mouseOver ? "opacity-0" : "",
            "tooltip absolute z-10 -mt-4 inline-block rounded-lg bg-gray-700 px-3 py-2 text-sm text-white   shadow-sm transition-opacity duration-300  dark:bg-gray-600",
          )}
        >
          <p>Precio con descuentos</p>
          <hr className="mb-4" />
          <div className="grid grid-cols-3">
            {discountUsers?.map((d) => (
              <Fragment key={d.id}>
                <div className="capitalize">{d.name}:</div>
                <div className="ml-2 text-right">
                  ${" "}
                  {d.discount !== 0 ? (
                    precioFormato(
                      ((d.discount as number) / 10000) *
                        (product?.price as number),
                    )
                  ) : (
                    <>{precioFormato(product?.price)}</>
                  )}{" "}
                </div>
                <div className="text-center font-medium text-green-200">
                  {d.discount !== null &&
                    d.discount !== 0 &&
                    formatAsPercentage(10000 - d.discount)}
                </div>
              </Fragment>
            ))}
          </div>
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
        <dt className="mb-2 font-semibold leading-4">Inventario</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center rounded bg-blue-200 px-2.5 py-0.5 font-medium text-blue-800">
            <HashtagIcon className="mr-1 h-3 w-3" />
            {product?.stock} {unitProduct}
          </span>
        </dd>
        <dt className="mb-2 font-semibold leading-4">Marca</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400">
          {product?.brand}
        </dd>
        <dt className="mb-2 font-semibold leading-4">Categorías</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400 ">
          {categories?.map((cat, i) => (
            <div className={`ml-${4 * i}`} key={i}>
              {i > 0 && <ArrowDownRightIcon className="-ml-4 w-3" />}
              <p className="-mt-1">{cat.name}</p>
            </div>
          ))}
        </dd>
        <dt className="mb-2 font-semibold leading-4">Tipo</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400">
          {product?.type}
        </dd>
        <dt className="mb-2 font-semibold leading-4">Dimensiones (cm)</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400">
          {product?.length} x {product?.width} x {product?.height}
        </dd>
        <dt className="mb-2 font-semibold leading-4">Peso (gramos)</dt>
        <dd className="mb-5 pl-2 text-gray-500 dark:text-gray-400">
          {product?.weight}
        </dd>
        <dt className="mb-2 font-semibold leading-4">Etiquetas</dt>
        <dd className="m-x-2 mb-3 inline-flex flex-wrap">
          {product?.tags.map((tag, index) => (
            <div
              className="m-1 rounded-lg bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              key={index}
            >
              {tag}
            </div>
          ))}
        </dd>
      </dl>
      {(product?.brochure || product?.manual) && (
        <ul className="flex divide-x divide-gray-200 rounded-lg text-center text-sm font-medium text-gray-500 shadow dark:divide-gray-700 dark:text-gray-400">
          {product?.brochure && (
            <li className="w-full">
              <button
                className={classNames(
                  currentPdf === "brochure"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700"
                    : "bg-white hover:bg-gray-50 hover:text-gray-700  dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white",
                  product?.manual ? "rounded-l-lg" : "rounded-lg",
                  "inline-block w-full  p-4   dark:text-white",
                )}
                aria-current="page"
                onClick={() => setCurrentPDf("brochure")}
              >
                Ficha
              </button>
            </li>
          )}
          {product?.manual && (
            <li className="w-full">
              <button
                className={classNames(
                  currentPdf === "manual"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700"
                    : "bg-white hover:bg-gray-50 hover:text-gray-700  dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white",
                  product?.brochure ? "rounded-r-lg" : "rounded-lg",
                  "inline-block w-full  p-4  dark:text-white",
                )}
                onClick={() => setCurrentPDf("manual")}
              >
                Manual
              </button>
            </li>
          )}
        </ul>
      )}
      {product?.brochure && currentPdf === "brochure" ? (
        <div className="">
          <embed
            className="my-5 h-96 w-full rounded-lg border"
            src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product?.brochure?.path}/${product.brochure?.original}`}
            type="application/pdf"
          />
        </div>
      ) : (
        ""
      )}
      {product?.manual && currentPdf === "manual" ? (
        <div className="">
          <embed
            className="my-5 h-96 w-full rounded-lg border"
            src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product?.manual?.path}/${product.manual?.original}`}
            type="application/pdf"
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );

  return (
    <PageComponent
      name="product"
      page="show"
      translate="producto"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {!product ? (
        <div>No existe este producto</div>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <>
          <nav
            className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
            aria-label="Breadcrumb"
          >
            <Link
              href="/admin/producto"
              className="inline-flex items-center space-x-3 text-sm font-medium"
            >
              <ChevronLeftIcon
                className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <span>Productos</span>
            </Link>
          </nav>
          <div className="my-auto rounded-2xl bg-white px-4 py-10 dark:bg-transparent">
            <div className="items-left flex justify-between">
              <h2 className="mb-2 text-5xl font-semibold">{product?.name}</h2>
              <div className="flex flex-wrap items-center">
                {canUpdate.status && (
                  <a
                    type="button"
                    href={`${product?.slug}/editar`}
                    className="mb-2 mr-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <PencilSquareIcon className="-ml-1 mr-1 w-5" />
                    Editar
                  </a>
                )}
                <Link
                  href={`http://localhost:8080/${product.slug}`}
                  target="_blank"
                  className="mb-2 mr-4 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
                >
                  Vista previa
                </Link>
                {canDelete.status && (
                  <button
                    type="button"
                    className="inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                    onClick={() => deleteProductHandler(product.id)}
                  >
                    <TrashIcon className="-ml-1 mr-1 w-5" />
                    Borrar
                  </button>
                )}
              </div>
            </div>
            <p className="mb-2 ml-4  font-light">SKU: {product?.SKU}</p>
            <p className="mb-2 ml-4 text-2xl font-light">
              {product?.producer.length === 0 ? (
                "Sin fabricante asignado"
              ) : (
                <>
                  Fabricado por:{" "}
                  {product?.producer.map(({ producer }) => producer.name)}
                </>
              )}
            </p>
            <div className="ml-4 flex space-x-4">
              <span>
                {product?.approval.includes("admin") ? (
                  <span className="mb-2 inline-flex text-lg font-light">
                    <span>
                      <CheckBadgeIcon className="mt-1 w-5 fill-green-400 stroke-black stroke-1" />
                    </span>
                    Publicado
                  </span>
                ) : (
                  <span className="mb-2 inline-flex text-lg font-light">
                    <span>
                      <ClockIcon className="mt-1 w-5 fill-gray-400 stroke-black stroke-0" />
                    </span>
                    Sin publicar
                  </span>
                )}
              </span>
              <span className="mt-0.5 inline-flex font-light">
                Diseño{" "}
                {product.approval.includes("design") ? (
                  <span title="Aprobado">
                    <ShieldCheckIcon className="mt-0.5 w-5 fill-green-400 stroke-black stroke-2" />
                  </span>
                ) : (
                  <span title="Pendiente">
                    <ShieldExclamationIcon className="mt-0.5 w-5 fill-amber-400 stroke-black stroke-2" />
                  </span>
                )}
              </span>
              <br />
              <span className="mt-0.5 inline-flex font-light">
                SEO{" "}
                {product.approval.includes("seo") ? (
                  <span title="Aprobado">
                    <ShieldCheckIcon className="mt-0.5 w-5 fill-green-400 stroke-black stroke-2" />
                  </span>
                ) : (
                  <span title="Pendiente">
                    <ShieldExclamationIcon className="mt-0.5 w-5 fill-amber-400 stroke-black stroke-2" />
                  </span>
                )}
              </span>
            </div>
            {windowSize ? (
              <>
                <div className="-mt-5 mb-4 grid grid-cols-3 gap-12 2xl:grid-cols-5">
                  {/* <!-- Column --> */}

                  <div className="col-span-2">{infoProduct}</div>
                  {/* <!-- Column --> */}
                  {infoAdicional}
                  <div className="col-span-2">
                    <div className="mb-4 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <ul className="-mb-px flex flex-wrap">
                        <li className="mr-2">
                          <button
                            onClick={() => setProductTable(0)}
                            className={classNames(
                              productTable === 0
                                ? "active inline-block rounded-t-lg border-b-2 border-blue-600 p-4 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                : "inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300",
                            )}
                          >
                            Complementos
                          </button>
                        </li>
                        <li className="mr-2">
                          <button
                            className={classNames(
                              productTable === 1
                                ? "active inline-block rounded-t-lg border-b-2 border-blue-600 p-4 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                : "inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300",
                            )}
                            onClick={() => setProductTable(1)}
                          >
                            Relacionados
                          </button>
                        </li>
                      </ul>
                    </div>
                    {productTable === 0 && product && product?.complements && (
                      <>
                        <dt className="mb-2 font-semibold leading-4">
                          Complementos
                        </dt>
                        <div>
                          {ProductTable(
                            product.complements.map((c) => c.complement),
                          )}
                        </div>
                      </>
                    )}
                    {productTable === 1 && product && product?.relations && (
                      <>
                        <dt className="mb-2 font-semibold leading-4">
                          Relacionados
                        </dt>
                        <div>
                          {ProductTable(
                            product.relations.map((c) => c.relation),
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <SideFormElement show={open} onClose={setOpen}>
                  <h2 className="mb-10 text-2xl font-semibold leading-4">
                    Información SEO
                  </h2>
                  <Accordion
                    value={product.seo as SeoPassed}
                    slug={product.slug}
                    className="pl-3"
                  />
                </SideFormElement>
                <SideFormElement
                  show={openHistorial}
                  onClose={setOpenHistorial}
                >
                  <h2 className="mb-10 text-2xl font-semibold leading-4">
                    {product.name}
                  </h2>
                  <ProductHistory product={product} />
                </SideFormElement>
                <SideFormElement
                  show={openAttributes}
                  onClose={setOpenAttributes}
                >
                  <h2 className="mb-10 text-2xl font-semibold leading-4">
                    Atributos de {product.name}
                  </h2>
                  {attributeTable}
                </SideFormElement>
              </>
            ) : (
              <section aria-labelledby="applicant-information-title">
                <div className="">
                  <div className="xs:px-2 px-4 py-5 sm:px-6">
                    <div className="xs:block hidden sm:block">
                      <div className="border-b border-gray-200">
                        <ul
                          className="flex flex-wrap border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
                          aria-label="Tabs"
                        >
                          {tabs.map((tab) => (
                            <li key={tab.name} className="mr-2">
                              <button
                                onClick={() => setCurrentTab(tab.name)}
                                className={classNames(
                                  tab.current
                                    ? "active inline-block rounded-t-lg bg-gray-100 p-4 text-blue-600 dark:bg-gray-800 dark:text-blue-500"
                                    : "inline-block rounded-t-lg p-4 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                                )}
                                aria-current={tab.current ? "page" : undefined}
                              >
                                {tab.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  {currentTab === "General" ? (
                    <>{infoProduct}</>
                  ) : currentTab === "Detalles" ? (
                    <>{infoAdicional}</>
                  ) : currentTab === "Atributos" ? (
                    <>{attributeTable}</>
                  ) : currentTab === "Complementos" ? (
                    <>
                      {ProductTable(
                        product.complements.map((c) => c.complement),
                      )}
                    </>
                  ) : currentTab === "Relacionados" ? (
                    <>
                      {ProductTable(product.relations.map((c) => c.relation))}
                    </>
                  ) : currentTab === "SEO" ? (
                    <Accordion
                      value={product.seo as SeoPassed}
                      slug={product.slug}
                      className="pl-3"
                    />
                  ) : (
                    <ProductHistory product={product} />
                  )}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
