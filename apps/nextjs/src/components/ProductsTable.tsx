import { Fragment, useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import type { Product } from "@prisma/client";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import SearchElement from "~/components/forms/elements/SearchElement";
import FixedImage from "~/components/images/FixedImage";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";

interface Props {
  AddFunc?: boolean;
  handleAdd?: (productId: string) => void;
  handleRemove?: (productId: string) => void;
  idArray?: string[];
  stateTd?: boolean;
  imageTd?: boolean;
  stockTd?: boolean;
  producerTd?: boolean;
  categoryTd?: boolean;
  priceTd?: boolean;
  approveTd?: boolean;
  buttonSubmit?: boolean;
  sortedAdded?: boolean;
}

export default function ProductsTable({
  stateTd = true,
  imageTd = true,
  stockTd = true,
  producerTd = true,
  categoryTd = true,
  priceTd = true,
  approveTd = true,
  buttonSubmit = true,
  sortedAdded = false,
  AddFunc,
  idArray,
  handleAdd,
  handleRemove,
}: Props) {
  const session = useSession();
  const canShow = hasPermission(session.data, "show_product");
  const canUpdate = hasPermission(session.data, "update_product");
  const canDelete = hasPermission(session.data, "delete_product");
  const utils = trpc.useContext();
  const products = trpc.product.all.useQuery();
  const { mutate: deleteProduct } = trpc.product.delete.useMutation({
    async onSuccess() {
      await utils.product.all.invalidate();
      await Toast.fire({
        title: "El product ha sido borrado!",
        icon: "success",
      });
    },
  });
  const [filterProducts, setFilterProducts] = useState(products.data);
  const [designApro, setDesignApro] = useState<boolean>(false);
  const [statusVal, setStatusVal] = useState<string>("todos");
  const [seoApro, setSeoApro] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(1);
  const [showing, setShowing] = useState(10);
  const [stockCount, setStockCount] = useState<string>("inventario");
  const [producerSelect, setProducerSelect] = useState<
    Array<string | undefined>
  >([]);

  const producersArray = products.data
    ?.map((product) => {
      if (product.producer.length === 0) {
        return;
      } else {
        return {
          value: product.producer.map(({producer}) => producer)[0]?.name,
          label: product.producer.map(({producer}) => producer)[0]?.name,
          checked: producerSelect.includes(product.producer.map(({producer}) => producer)[0]?.name),
        };
      }
    })
    .filter(Boolean);
  const filteredArray = producersArray?.filter(
    (field, index, array) =>
      array.findIndex(
        (t) => t?.value === field?.value && t?.label === field?.label,
      ) == index,
  );
  filteredArray?.push({
    value: "No",
    label: "Sin fabricante",
    checked: producerSelect.includes("No"),
  });
  const producerFilter = [
    {
      id: "producer",
      name: "fabricante",
      options: filteredArray,
    },
  ];
  const filters = [
    {
      id: "approval",
      name: "aprobado",
      options: [
        { value: "design", label: "Diseño verificado", checked: designApro },
        { value: "seo", label: "SEO verificado", checked: seoApro },
      ],
    },
  ];
  const warn = [
    {
      id: "inventario",
      name: stockCount,
      options: [
        {
          value: "inventario",
          label: "Inventario",
          checked: true,
        },
        {
          value: "suficiente",
          label: "Con inventario",
        },
        {
          value: "poco",
          label: "Poco inventario",
        },
        {
          value: "sin",
          label: "Sin inventario",
        },
      ],
    },
  ];
  const status = [
    {
      id: "todos",
      name: statusVal,
      options: [
        { value: "todos", label: "todos", checked: true },
        { value: "publicado", label: "Publicado" },
        { value: "borrador", label: "Pendiente" },
      ],
    },
  ];
  const myTD = ["", "", "", "", "", "", "", "", ""];

  useEffect(() => {
    const searchVal = () => {
      if (search === "") {
        return products.data;
      } else {
        return products.data?.filter((product) =>
          product.name.toLowerCase().includes(search.toLowerCase()),
        );
      }
    };
    const status = () => {
      if (statusVal === "todos") {
        return searchVal();
      } else {
        if (statusVal === "publicado") {
          return searchVal()?.filter((product) => {
            return product.approval.includes("admin");
          });
        } else {
          return searchVal()?.filter(
            (product) => !product.approval.includes("admin"),
          );
        }
      }
    };
    const approve = () => {
      if (seoApro === false && designApro === false) {
        return status();
      } else {
        if (seoApro === true && designApro === false) {
          return status()?.filter((product) =>
            product.approval.includes("seo"),
          );
        } else if (designApro === true && seoApro === false) {
          return status()?.filter((product) =>
            product.approval.includes("design"),
          );
        } else {
          const values = ["seo", "design"];
          return status()?.filter((product) =>
            values.every((value) => {
              return product.approval.includes(value);
            }),
          );
        }
      }
    };
    const producerCheck = () => {
      if (producerSelect.length === 0) {
        return approve();
      } else {
        const myArr = approve()?.filter((r) =>
          r.producer?.map(({producer}) => producer)?.some((i) => producerSelect.includes(i.name)),
        );
        const noProducer = products.data?.filter(
          (r) => r.producer.length === 0,
        );
        if (producerSelect.includes("No") && myArr && noProducer) {
          return myArr.concat(noProducer);
        } else {
          return myArr;
        }
      }
    };
    const stockWarn = () => {
      switch (stockCount) {
        case "suficiente":
          return producerCheck()?.filter(
            (product) => product.stock > product.stockWarn,
          );
        case "poco":
          return producerCheck()?.filter(
            (product) =>
              product.stock <= product.stockWarn && product.stock !== 0,
          );
        case "sin":
          return producerCheck()?.filter((product) => product.stock === 0);
        default:
          return producerCheck();
      }
    };
    const final = stockWarn();
    setFilterProducts(final);
  }, [
    search,
    products.data,
    statusVal,
    seoApro,
    designApro,
    producerSelect,
    stockCount.length,
    stockCount,
  ]);

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
   * @param {Product} value
   * @returns {string} formatted value
   */
  function formatAsPrice(value: Product): string {
    let valorNuevo = value.price;
    return (valorNuevo /= 100).toLocaleString("es-MX", {
      style: "currency",
      currency: `${value.currency ? value.currency : ""}`,
    });
  }

  /**
   * Checks if the product is authorized to be published.
   * Returns a diferent Icon depending on the publish value.
   *
   * @param {Product} product
   * @param {string} value
   * @returns {JSX.Element} html element
   */
  function published(product: Product, value: string): JSX.Element {
    if (product?.approval.includes(value)) {
      return (
        <span
          title="Publicado"
          className="mr-2 inline-flex items-center rounded-full bg-green-100 p-1 text-sm font-semibold text-gray-800 dark:bg-green-900 dark:text-green-300"
        >
          <CheckCircleIcon className="w-5 stroke-2" />
          <span className="sr-only">Icon description</span>
        </span>
      );
    } else {
      return (
        <span
          title="Borrador"
          className="mr-2 inline-flex items-center rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        >
          <ClockIcon className="w-5 stroke-2" />
          <span className="sr-only">Icon description</span>
        </span>
      );
    }
  }

  /**
   * Handles checkBox input change.
   * setState to render based on selected producers.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleProducerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isValue = e.target.value;
    if (!producerSelect.includes(isValue)) {
      return setProducerSelect([...producerSelect, isValue]);
    } else {
      return setProducerSelect((producerSelect) =>
        producerSelect.filter((data) => data !== e.target.value),
      );
    }
  }

  /**
   * Handles checkBox input change.
   * setState to render based on selected stock wwarn.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleStockChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const isValue = e.target.value;
    setStockCount(isValue);
  }

  /**
   * Handles radio input change.
   * setState to render based on seo or design approval.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleApproveChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;
    const isValue = e.target.value;
    if (isValue === "seo") {
      setSeoApro(isChecked);
    } else {
      setDesignApro(isChecked);
    }
  }

  /**
   * Handles radio input change.
   * setState to render based on publication approval.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const isValue = e.target.value;
    setStatusVal(isValue);
  }

  const items = [];
  for (
    let number = 1;
    number <= Math.ceil((filterProducts?.length as number) / showing);
    number++
  ) {
    items.push(
      <li>
        <button
          type="button"
          key={number}
          onClick={() => {
            setActive(number);
            // window.scrollTo(0, 0);
          }}
          className={classNames(
            number === active
              ? "z-10 border border-blue-300 bg-blue-50 px-3 py-2 leading-tight text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              : "border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
          )}
        >
          {number}
        </button>
      </li>,
    );
  }
  // const sortedArr = filterProducts?.reduce((acc, element) => {
  //   if (idArray && idArray.includes(element.id)) {
  //     return [element, ...acc];
  //   }
  //   return [...acc, element];
  // }, []);
  /**
   * Includes value first
  */
 
//  const sortedArr = filterProducts?.sort((a, b) => idArray?.includes(b.id) - idArray?.includes(a.id));

 const sortedArr = filterProducts?.sort((a, b) => {
  const aIsInArray = idArray?.includes(a.id);
  const bIsInArray = idArray?.includes(b.id);

  return Number(bIsInArray) - Number(aIsInArray);
});

  return (
    <>
      <SearchElement
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        value={search}
        disabled={products.isLoading ? true : false}
      />

      <TableElement>
        <TableHead>
          {stateTd && (
            <TableHeadCol className="hidden lg:table-cell">
              <Menu as="div" className="relative inline-block text-left">
                <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                  {status.map((section, sectionIdx) => (
                    <Popover
                      as="div"
                      key={section.name}
                      id={`desktop-menu-${sectionIdx}`}
                      className="relative inline-block text-left"
                    >
                      <div className="inline-flex items-center">
                        <span>{section.name}</span>
                        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          <ChevronDownIcon
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </Popover.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="fixed z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-lg bg-white p-4 shadow dark:divide-gray-600 dark:bg-gray-700">
                          <form className="space-y-4">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                                  onChange={(e) => {
                                    handleRadioChange(e);
                                    setActive(1);
                                  }}
                                  checked={
                                    option.value === statusVal ? true : false
                                  }
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </Menu>
            </TableHeadCol>
          )}
          {imageTd && <TableHeadCol>imagen</TableHeadCol>}
          <TableHeadCol>nombre</TableHeadCol>
          {stockTd && (
            <TableHeadCol className="hidden lg:table-cell">
              <Menu as="div" className="relative inline-block text-left">
                <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                  {warn.map((section, sectionIdx) => (
                    <Popover
                      as="div"
                      key={section.name}
                      id={`desktop-menu-${sectionIdx}`}
                      className="relative inline-block text-left"
                    >
                      <div className="inline-flex items-center">
                        <span>{section.name}</span>
                        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          <ChevronDownIcon
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </Popover.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="fixed z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-lg bg-white p-4 shadow dark:divide-gray-600 dark:bg-gray-700">
                          <form className="space-y-4">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                                  onChange={(e) => {
                                    handleStockChange(e);
                                    setActive(1);
                                  }}
                                  checked={
                                    option.value === stockCount ? true : false
                                  }
                                />
                                <label
                                  htmlFor={`filter-${section.id}-${optionIdx}`}
                                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </Menu>
            </TableHeadCol>
          )}
          {producerTd && (
            <TableHeadCol>
              {" "}
              <Menu as="div" className="relative inline-block text-left">
                <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                  {producerFilter.map((section, sectionIdx) => (
                    <Popover
                      as="div"
                      key={section.name}
                      id={`desktop-menu-${sectionIdx}`}
                      className="relative inline-block text-left"
                    >
                      <div className="inline-flex items-center">
                        <span>{section.name}</span>
                        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          <ChevronDownIcon
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </Popover.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="fixed z-10 w-48 rounded-lg bg-white shadow dark:bg-gray-700">
                          <form className="space-y-4">
                            <div className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200">
                              {section.options?.map((option, optionIdx) => (
                                <div
                                  key={option?.value}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option?.value}
                                    checked={option?.checked}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                                    onChange={(e) => {
                                      handleProducerChange(e);
                                      setActive(1);
                                    }}
                                  />
                                  <label
                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                    className="ml-2 w-full rounded text-sm font-medium text-gray-900 dark:text-gray-300"
                                  >
                                    {option?.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </Menu>
            </TableHeadCol>
          )}
          {categoryTd && <TableHeadCol>categoría</TableHeadCol>}
          {priceTd && <TableHeadCol>precio</TableHeadCol>}
          {approveTd && (
            <TableHeadCol>
              <Menu as="div" className="relative inline-block text-left">
                <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                  {filters.map((section, sectionIdx) => (
                    <Popover
                      as="div"
                      key={section.name}
                      id={`desktop-menu-${sectionIdx}`}
                      className="relative inline-block text-left"
                    >
                      <div className="inline-flex items-center">
                        <span>{section.name}</span>
                        <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                          <ChevronDownIcon
                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                        </Popover.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Popover.Panel className="fixed z-10 w-48 rounded-lg bg-white shadow dark:bg-gray-700">
                          <form className="space-y-4">
                            <div className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200">
                              {section.options.map((option, optionIdx) => (
                                <div
                                  key={option.value}
                                  className="flex items-center"
                                >
                                  <input
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    defaultValue={option.value}
                                    checked={option.checked}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                                    onChange={(e) => {
                                      handleApproveChange(e);
                                      setActive(1);
                                    }}
                                  />
                                  <label
                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                    className="ml-2 w-full rounded text-sm font-medium text-gray-900 dark:text-gray-300"
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  ))}
                </Popover.Group>
              </Menu>
            </TableHeadCol>
          )}
          <TableHeadCol></TableHeadCol>
        </TableHead>
        <TableBody>
          {products.isLoading ? (
            <TableRow className="animate-pulse">
              {myTD.map((tdx, index) => (
                <TableData key={index}>
                  <div className="h-4 rounded bg-gray-300">{tdx}</div>
                </TableData>
              ))}
            </TableRow>
          ) : filterProducts?.length === 0 ? (
            <>
              <td colSpan={8} className="h-24 content-center text-center ">
                <span className="text-2xl font-bold">
                  No se encontraron productos
                </span>
              </td>
            </>
          ) : (
            (sortedAdded ? sortedArr : filterProducts)
              ?.slice(active * showing - showing, active * showing)
              .map((product) => (
                <TableRow key={product.id}>
                  {stateTd && (
                    <TableData className="hidden lg:table-cell">
                      {published(product, "admin")}
                    </TableData>
                  )}
                  {imageTd && (
                    <TableData>
                      <span title={product.slug}>
                        <FixedImage
                          width={32}
                          image={product.image}
                          className="h-8 w-8 rounded-full"
                        />
                      </span>
                    </TableData>
                  )}
                  <TableData>
                    {canShow.status ? (
                      <Link
                        href={`/admin/producto/${product.slug}`}
                        className="font-bold hover:text-black dark:hover:text-white"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <p className="font-bold hover:text-black dark:hover:text-white">
                        {product.name}
                      </p>
                    )}
                  </TableData>
                  {stockTd && (
                    <TableData>
                      <span
                        className={classNames(
                          product.stock === 0
                            ? "text-red-600 dark:text-red-400"
                            : product.stock <= product.stockWarn
                            ? "text-yellow-500  dark:text-yellow-300"
                            : "text-green-600 dark:text-green-400",
                          "inline text-center text-base font-medium",
                        )}
                      >
                        {product.stock}{" "}
                      </span>

                      {product.unit &&
                        (product?.unit?.slice(-1) === "s" ||
                        product?.stock === 1
                          ? product?.unit
                          : product?.unit?.slice(-1) === "d" ||
                            product?.stock === 1
                          ? (product?.unit) + "es"
                          : (product?.unit) + "s")}
                    </TableData>
                  )}
                  {producerTd && (
                    <TableData>
                      {canShow.status ? (
                        <>
                          {product.producer.length === 0 ? (
                            "Sin fabricante"
                          ) : (
                            <ul className="list-disc">
                              {product.producer.map(({producer}) => (
                                <li key={producer.id}>
                                  <Link
                                    href={`/admin/fabricante/${producer.slug}`}
                                    className="font-bold hover:text-black dark:hover:text-white"
                                  >
                                    {producer.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Posibilidad de ir a página del fabricante */}
                          {product.producer.length === 0 ? (
                            <p className="font-bold hover:text-black dark:hover:text-white">
                              Sin fabricante
                            </p>
                          ) : (
                            <ul className="font-bold hover:text-black dark:hover:text-white">
                              {product.producer.map(({producer}) => (
                                <li key={producer.id}>{producer.name}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </TableData>
                  )}
                  {categoryTd && (
                    <TableData>
                      {product.Category.length !== 0
                        ? product.Category?.filter(
                            (cat) => cat.parentId === null,
                          ).map((cat) => cat.name)
                        : "Sin categoría"}
                    </TableData>
                  )}

                  {priceTd && <TableData>{formatAsPrice(product)}</TableData>}
                  {approveTd && (
                    <TableData className="hidden sm:block">
                      <span className="inline-flex justify-items-center">
                        design{" "}
                        {product.approval.includes("design") ? (
                          <span title="Aprobado">
                            <ShieldCheckIcon className="ml-1 w-5 fill-green-400 stroke-black stroke-2 " />
                          </span>
                        ) : (
                          <span title="Pendiente">
                            <ShieldExclamationIcon className="ml-1 w-5 fill-amber-400 stroke-black stroke-2 " />
                          </span>
                        )}
                      </span>
                      <br />
                      <span className="inline-flex">
                        SEO{" "}
                        {product.approval.includes("seo") ? (
                          <span title="Aprobado">
                            <ShieldCheckIcon className="ml-[21px] w-5 fill-green-400 stroke-black stroke-2 " />
                          </span>
                        ) : (
                          <span title="Pendiente">
                            <ShieldExclamationIcon className="ml-[21px] w-5 fill-amber-400 stroke-black stroke-2 " />
                          </span>
                        )}
                      </span>
                    </TableData>
                  )}
                  <TableData className="w-1 whitespace-nowrap">
                    {AddFunc && handleAdd && !idArray?.includes(product.id) ? (
                      <ButtonElement
                        type={buttonSubmit ? "submit" : "button"}
                        onClick={() => handleAdd(product.id)}
                        intent="blue"
                        size="sm"
                        className="mr-2"
                      >
                        Añadir
                      </ButtonElement>
                    ) : (
                      handleRemove && (
                        <ButtonElement
                          type={buttonSubmit ? "submit" : "button"}
                          onClick={() => handleRemove(product.id)}
                          intent="danger"
                          size="sm"
                          className="mr-2"
                        >
                          Quitar
                        </ButtonElement>
                      )
                    )}
                    {!AddFunc && canUpdate.status && (
                      <LinkElement
                        href={`/admin/producto/${product.slug}/editar`}
                        intent="primary"
                        size="sm"
                        className="mr-2"
                      >
                        Editar
                      </LinkElement>
                    )}
                    {!AddFunc && canDelete.status && (
                      <ButtonElement
                        intent="danger"
                        size="sm"
                        onClick={() => deleteProductHandler(product.id)}
                      >
                        Borrar
                      </ButtonElement>
                    )}
                  </TableData>
                </TableRow>
              ))
          )}
        </TableBody>
      </TableElement>
      <div className="flex justify-center gap-x-8">
        <div className="mt-4 flex flex-col items-center">
          <form className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Productos por página:{" "}
            </label>
            {"  "}
            <select
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              onChange={(e) => {
                setShowing(Number(e.target.value));
                setActive(1);
              }}
            >
              <option selected={true} value={10}>
                10
              </option>
              <option value={20}>20</option>

              <option value={30}>30</option>
            </select>
          </form>
        </div>
        <div className="mt-4 flex flex-col items-center">
          <span className="mb-2 text-sm text-gray-700 dark:text-gray-400">
            Mostrando del{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {showing * active - showing + 1}
            </span>{" "}
            al{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {showing * active < (filterProducts?.length as number)
                ? showing * active
                : filterProducts?.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filterProducts?.length}
            </span>{" "}
            productos
          </span>
          <nav aria-label="Page navigation example">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    active === 1 ? setActive(1) : setActive(active - 1)
                  }
                  className="ml-0 block rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
              {items}
              <li>
                <button
                  type="button"
                  onClick={() =>
                    active === items.length
                      ? setActive(items.length)
                      : setActive(active + 1)
                  }
                  className="block rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
