import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  ArrowUturnLeftIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  QueueListIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import type { Permission as Permissions, Role as Rol } from "@prisma/client";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import { translatePermissions } from "~/utils/translation";
import ModalElement from "~/components/ModalElement";
import PageComponent from "~/components/PageComponent";
import SearchElement from "~/components/forms/elements/SearchElement";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import { capitalized } from "../permisos";

type Permission = Permissions & { permission: Permissions };
type Role = Rol & { permissions: Permission[] };
type OrderPermissions = {
  type: string;
  permissions: {
    permission: Permissions;
  }[];
};

export default function Page() {
  const session = useSession();
  const canOrder = hasPermission(session.data, "order_roles_special");
  const canUpdate = hasPermission(session.data, "update_roles");
  const canDelete = hasPermission(session.data, "delete_roles");
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.roles.all.useQuery();
  const { mutate: updateRoleOrder } = trpc.roles.order.useMutation({
    async onSuccess() {
      await utils.roles.all.invalidate();
      await Toast.fire({
        title: "Se cambió la jerarquía del rol!",
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
  const { mutate: deleteRole } = trpc.roles.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El rol ha sido borrado!",
        icon: "success",
      });
      await utils.roles.all.invalidate();
    },
  });
  const [list, setList] = useState(data?.filter(({ type }) => type === "team"));
  const [dataModal, setDataModal] = useState<Array<OrderPermissions>>([]);
  const [orderRoles, setOrderRoles] = useState<boolean>(false);
  const [statusVal, setStatusVal] = useState<string>("team");
  const [descOrder, setDescOrder] = useState<number>(0);
  const [filterRoles, setFilterRoles] = useState(data);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dragItem = useRef() as React.MutableRefObject<number | null>;
  const dragOverItem = useRef() as React.MutableRefObject<number | null>;
  useEffect(() => {
    if (data) {
      setList(data?.filter(({ type }) => type === "team"));
      setFilterRoles(data);
    }
  }, [data]);
  useEffect(() => {
    if (search === "") {
      setFilterRoles(data);
    } else {
      setFilterRoles(
        data?.filter((role) =>
          role.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, data, updateRoleOrder, list]);

  const userPermissions = session.data?.user?.permissions; //Checks all user permissions
  const hasSpecial = userPermissions?.some((r) => r.includes("special")); //Checks if user has any special permission
  const filteredData = filterRoles?.filter(({ type }) => type === statusVal); //Filters data by client or team type
  const userRoleHierarchy = data?.filter(
    (d) => d.name === session.data?.user?.role,
  )?.[0]?.hierarchy;
  const sortOptions = [
    {
      id: "tabla",
      name:
        "Mostrar datos: " +
        (translate(statusVal)?.toLocaleUpperCase() as string),
      options: [
        { value: "team", label: "Equipo", checked: true },
        { value: "client", label: "Clientes" },
      ],
    },
  ];

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteRoleHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRole({ id });
      }
    });
  }

  /**
   * Sets descOrder with a number between 0 - 2.
   * This value is then passed as a prop in the order function.
   *
   */
  function orderHandler() {
    if (descOrder < 2) {
      setDescOrder(descOrder + 1);
    } else {
      setDescOrder(0);
    }
  }

  /**
   * Sets list order by role discount.
   *
   * @param {number | undefined} value
   * @returns {object | undefined} sorted filteredData
   */
  function order(value: number | undefined): object | undefined {
    switch (value) {
      case 0:
        return filteredData?.sort((a: Rol, b: Rol) => {
          if (a.hierarchy !== null && b.hierarchy !== null) {
            return a.hierarchy - b.hierarchy;
          } else {
            return 0;
          }
        });
      case 1:
        return filteredData?.sort((a: Rol, b: Rol) => {
          if (a.discount !== null && b.discount !== null) {
            return a.discount - b.discount;
          } else {
            return 0;
          }
        });
      case 2:
        return filteredData?.sort((a: Rol, b: Rol) => {
          if (a.discount !== null && b.discount !== null) {
            return b.discount - a.discount;
          } else {
            return 0;
          }
        });
      default:
        return filteredData;
    }
  }

  /**
   * Translate passed value.
   *
   * @param {string | undefined} value
   * @returns {string | undefined} value translation
   */
  function translate(value: string | undefined): string | undefined {
    switch (value) {
      case "admin":
        return "administrador";
      case "client":
        return "cliente";
      case "team":
        return "equipo";
      default:
        return value;
    }
  }

  /**
   * Handles radio input change, setState to render team list or client list.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    const isValue = e.target.value;
    setStatusVal(isValue);
    setDescOrder(0);
  }

  /**
   * Restructure permissions data structure.
   * Sets dataModal as an array of premission objects.
   *
   * @param {Permission[]} permissions
   */
  function handleDataOrder(permissions: Permission[]) {
    const typePermission = [
      ...new Set(
        permissions?.map((per) =>
          per.permission.name
            .replace(
              /(list|access|authorize|show|create|update|delete|order)_/g,
              "",
            )
            .replace(/\_.*/, ""),
        ),
      ),
    ];
    if (hasSpecial) {
      typePermission.push("special");
    }
    const orderArray = typePermission
      .map((per) => {
        const obj = {
          type: per,
          permissions: permissions?.filter((permi) => {
            if (per !== "special") {
              return (
                permi.permission.name?.includes(per) &&
                !permi.permission.name?.includes("special")
              );
            } else {
              return permi.permission.name?.includes(per);
            }
          }),
        };
        return obj;
      })
      .sort((a, b) => {
        return a.type.localeCompare(b.type);
      });

    setOpen(true);
    setDataModal(orderArray);
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

  /**
   * When start dragging, sets dragItem.current as the position value.
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   * @param {number} position
   */
  const dragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // console.log(e, position);
  };

  /**
   * When dragging, sets dragOverItem.current as the position value.
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   * @param {number} position
   */
  const dragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    // console.log(e);
  };

  /**
   * When item is dropped, sets new role array order.
   * Updates role hierarchy in data base.
   *
   * @param {React.DragEvent<HTMLDivElement>} e
   */
  const drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const copyListItems = [...(list || [])];
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      if (dragItemContent) {
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      }
      dragItem.current = null;
      dragOverItem.current = null;
      setList(copyListItems);
    }
    const sendOrder = copyListItems?.map((rol, i) => {
      const obj = {
        id: rol.id,
        hierarchy: i,
      };
      return obj;
    });
    updateRoleOrder(sendOrder);
  };

  return (
    <PageComponent
      name="roles"
      page="list"
      translate="roles"
      translatePage="lista"
      icon={<SwatchIcon className="h-full w-full" />}
    >
      <SearchElement
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        value={search}
        disabled={orderRoles || isLoading ? true : false}
      />
      <div className="mx-auto mb-4 max-w-3xl px-4 text-center sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          {!orderRoles ? (
            <Menu as="div" className="relative inline-block text-left">
              <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
                {sortOptions.map((section, sectionIdx) => (
                  <Popover
                    as="div"
                    key={section.name}
                    id={`desktop-menu-${sectionIdx}`}
                    className="relative left-0 inline-block text-left"
                  >
                    <div className="inline-flex items-center">
                      <span className="font-semibold">{section.name}</span>
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
                                onChange={(e) => handleRadioChange(e)}
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
          ) : (
            <div className="relative inline-block text-left"></div>
          )}
          {canOrder.status && statusVal === "team"  && (
            <ButtonElement
              className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-sky-500 to-emerald-600 px-4 py-2 text-base font-medium capitalize text-white shadow-sm hover:from-sky-600 hover:to-emerald-700 focus:outline-none"
              onClick={() => setOrderRoles(!orderRoles)}
            >
              {!orderRoles ? (
                <QueueListIcon
                  className="-ml-1 mr-3 h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <ArrowUturnLeftIcon
                  className="-ml-1 mr-3 h-5 w-5"
                  aria-hidden="true"
                />
              )}
              {!orderRoles ? "Ordenar roles" : "Volver"}
            </ButtonElement>
          )}
        </div>
      </div>
      <TableElement>
        <TableHead>
          <TableHeadCol>Nombre</TableHeadCol>
          <TableHeadCol>Tipo</TableHeadCol>
          <TableHeadCol>
            {statusVal === "client" ? (
              <button className="hover:text-slate-500" onClick={orderHandler}>
                <div className="inline-flex items-center">
                  DESCUENTO
                  {descOrder === 1 ? (
                    <ChevronDoubleDownIcon className="ml-1 h-4 w-4" />
                  ) : descOrder === 2 ? (
                    <ChevronDoubleUpIcon className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronUpDownIcon className="h-5 w-6" />
                  )}
                </div>
              </button>
            ) : (
              "Permisos"
            )}
          </TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Editar</span>
          </TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Borrar</span>
          </TableHeadCol>
        </TableHead>
        {orderRoles && canOrder.status ? (
          <tbody onDragOver={(e) => e.preventDefault()}>
            {(list as unknown as Role[])?.map((role: Role, index: number) => (
              <tr
                key={role.id}
                onDragStart={(e) => dragStart(e, index)}
                onDragEnter={(e) => dragEnter(e, index)}
                onDragEnd={drop}
                draggable
                className=" border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <TableData className=" relative cursor-grab text-sm active:cursor-grabbing">
                  <p className="font-bold hover:text-black dark:hover:text-white">
                    <span className="absolute left-3 top-[18px] text-xl">
                      :::
                    </span>{" "}
                    <span className="-mr-5 ml-3">
                      {translate(role.name)?.toUpperCase()}
                    </span>
                  </p>
                </TableData>

                <TableData className="">
                  <span
                    className={classNames(
                      "border-green-600 text-green-600  dark:border-green-400 dark:text-green-400",
                      "mr-2 rounded-full border  px-2.5  py-0.5 font-medium capitalize",
                    )}
                  >
                    {translate(role?.type)}
                  </span>
                </TableData>

                <TableData className="">
                  {role.type === "team" ? (
                    <span className="mr-2 rounded-full border border-blue-600 px-2.5  py-0.5 font-medium capitalize text-blue-600  dark:border-blue-400 dark:text-blue-400 ">
                      {role.permissions.length !== 0 ? (
                        <button
                          onClick={() => handleDataOrder(role.permissions)}
                        >
                          {role.permissions.length} permisos
                        </button>
                      ) : (
                        <button>{role.permissions.length} permisos</button>
                      )}
                    </span>
                  ) : (
                    "No aplicable"
                  )}
                </TableData>
                <TableData className="relative text-sm font-medium ">
                  {canUpdate.status &&
                    (role.hierarchy as number) >=
                      (userRoleHierarchy as number) && (
                      <LinkElement
                        intent="primary"
                        href={`/admin/roles/${role.id}/editar`}
                        size="sm"
                      >
                        Editar
                      </LinkElement>
                    )}
                </TableData>
                <TableData className="relative text-sm font-medium ">
                  {canDelete.status &&
                  (role.hierarchy as number) >=
                    (userRoleHierarchy as number) ? (
                    <ButtonElement
                      intent="danger"
                      onClick={() => deleteRoleHandler(role.id)}
                      size="sm"
                      className="-ml-10"
                    >
                      Borrar
                    </ButtonElement>
                  ) : (
                    <div className="h-10">
                      <span className="sr-only">Sin accion</span>
                    </div>
                  )}
                </TableData>
              </tr>
            ))}
          </tbody>
        ) : (
          <TableBody>
            {(order(descOrder) as unknown as Role[])?.map((role: Role) => (
              <TableRow key={role.id}>
                <TableData className="text-sm">
                  <p className="font-bold hover:text-black dark:hover:text-white">
                    {translate(role.name)?.toUpperCase()}
                  </p>
                </TableData>

                <TableData className="">
                  <span
                    className={classNames(
                      role.type === "client"
                        ? "border-blue-600 text-blue-600  dark:border-blue-400 dark:text-blue-400"
                        : "border-green-600 text-green-600  dark:border-green-400 dark:text-green-400",
                      "mr-2 rounded-full border  px-2.5  py-0.5 font-medium capitalize",
                    )}
                  >
                    {translate(role?.type)}
                  </span>
                </TableData>

                <TableData className="">
                  {role?.discount || role?.discount === 0 ? (
                    <span className="mr-2 rounded-full border border-blue-600 px-2.5  py-0.5 font-medium capitalize text-blue-600  dark:border-blue-400 dark:text-blue-400 ">
                      {formatAsPercentage(role.discount)}
                    </span>
                  ) : role.type === "team" ? (
                    <span className="mr-2 rounded-full border border-blue-600 px-2.5  py-0.5 font-medium capitalize text-blue-600  dark:border-blue-400 dark:text-blue-400 ">
                      {role.permissions.length !== 0 ? (
                        <button
                          onClick={() => handleDataOrder(role.permissions)}
                        >
                          {role.permissions.length} permisos
                        </button>
                      ) : (
                        <button>{role.permissions.length} permisos</button>
                      )}
                    </span>
                  ) : (
                    "No aplicable"
                  )}
                </TableData>
                <TableData className="relative text-sm font-medium ">
                  {canUpdate.status &&
                    (role.hierarchy as number) >=
                      (userRoleHierarchy as number) && (
                      <LinkElement
                        intent="primary"
                        href={`/admin/roles/${role.id}/editar`}
                        size="sm"
                      >
                        Editar
                      </LinkElement>
                    )}
                </TableData>
                <TableData className="relative text-sm font-medium ">
                  {canDelete.status &&
                    (role.hierarchy as number) >=
                      (userRoleHierarchy as number) && (
                      <ButtonElement
                        intent="danger"
                        onClick={() => deleteRoleHandler(role.id)}
                        size="sm"
                        className="-ml-10"
                      >
                        Borrar
                      </ButtonElement>
                    )}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        )}
      </TableElement>
      <ModalElement open={open} setOpen={setOpen}>
        <div>
          <h1 className="text-xl font-semibold dark:text-white">Permisos</h1>
          <hr className="mb-3" />
          <div className="flex flex-wrap pl-4 pr-16">
            {dataModal &&
              dataModal.map((data: OrderPermissions, i) => {
                return (
                  <div key={i} className="w-40  p-6">
                    <h2 className="text-l font-semibold dark:text-white">
                      {translatePermissions(data.type)?.toUpperCase()}
                    </h2>
                    <hr className=" mb-2 mr-10" />

                    <ul>
                      {data.permissions?.map((p) => {
                        const words = (p.permission?.name)
                          .split(/[_]+/)
                          .filter((e) => e !== "special");
                        return (
                          <li
                            key={p.permission?.id}
                            className="list-disc text-sm dark:text-white "
                          >
                            {words.map(
                              (per) =>
                                `${
                                  capitalized(
                                    translatePermissions(per),
                                  ) as string
                                } `,
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            <div className="m-5">
              <ButtonElement
                size="lg"
                className="absolute bottom-10  right-10 h-10"
                onClick={() => setOpen(false)}
              >
                Volver
              </ButtonElement>
            </div>
          </div>
        </div>
      </ModalElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
