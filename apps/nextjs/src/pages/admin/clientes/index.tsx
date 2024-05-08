import { Fragment, useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon, UsersIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import { env } from "~/env.mjs";

export default function Page() {
  const session = useSession();
  const utils = trpc.useContext();
  const canShow = hasPermission(session.data, "show_user");
  const canUpdate = hasPermission(session.data, "update_client");
  const canDelete = hasPermission(session.data, "delete_client");
  const canDisable = hasPermission(session.data, "disable_client");
  const { data } = trpc.users.all.useQuery();
  const [roleSelect, setRoleSelect] = useState<Array<string | undefined>>([]);
  const [statusVal, setStatusVal] = useState<string>("");

  const [filterClient, setFilterClient] = useState(
    data?.filter((data) => data?.role?.type === "client"),
  );

  const filters = [
    {
      id: "rol",
      name: "rol",
      options: [
        {
          value: "usuario",
          label: "General",
          checked: roleSelect.includes("usuario"),
        },
        {
          value: "distribuidor",
          label: "Distribuidor",
          checked: roleSelect.includes("distribuidor"),
        },
        {
          value: "mayorista",
          label: "Mayorista",
          checked: roleSelect.includes("mayorista"),
        },
        {
          value: "personalizado",
          label: "Personalizado",
          checked: roleSelect.includes("personalizado"),
        },
      ],
    },
  ];

  const status = [
    {
      id: "status",
      name: "estatus",
      options: [
        {
          value: "",
          label: "Estatus",
          checked: true,
        },
        {
          value: "active",
          label: "activo",
        },
        {
          value: "disable",
          label: "inhabilitado",
        },
        {
          value: "noAcc",
          label: "Sin cuenta",
        },
        {
          value: "deleted",
          label: "borrado",
        },
      ],
    },
  ];

  /**
   * Handles radio input change.
   * setState to render based on usuario role.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleRoleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isValue = e.target.value;
    if (!roleSelect.includes(isValue)) {
      return setRoleSelect([...roleSelect, isValue]);
    } else {
      return setRoleSelect((roleSelect) =>
        roleSelect.filter((data) => data !== e.target.value),
      );
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
  }

  const { mutate: updateClient } = trpc.users.disable.useMutation({
    async onSuccess() {
      await utils.users.all.invalidate();
      // await Toast.fire({
      //   title: 'El cliente ha sido actualizado!',
      //   icon: 'success',
      // });
    },
  });

  /**
   * Thist function deletes a user from the DB
   */
  const { mutate: deleteClient } = trpc.users.delete.useMutation({
    async onSuccess() {
      await utils.users.all.invalidate();
      await Toast.fire({
        title: "El cliente ha sido borrado!",
        icon: "success",
      });
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function deleteClientHandler(id: string) {
    const dateNow = new Date(Date.now());
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
      text: "Esta acción borrará al cliente de la lista!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteClient({ id, deletedAt: dateNow });
      }
    });
  }

  /**
   * If confirmed restore, else, return
   *
   * @param {string} id
   */
  function restoreClientHandler(id: string) {
    deleteClient({ id, deletedAt: null });
  }

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function disableClientHandler(id: string, disable: boolean | null) {
    if (disable === false) {
      await ConfirmModal.fire({
        text: "Esta acción deshabilitará al usuario!",
        confirmButtonText: "Sí, seguir!",
      }).then((result) => {
        if (result.isConfirmed) {
          updateClient({ id, disable: !disable });
        }
      });
    } else if (disable === true) updateClient({ id, disable: !disable });
    else return;
  }

  useEffect(() => {
    const client = data?.filter((data) => data?.role?.type === "client");
    if (roleSelect.length === 0 && statusVal === "") {
      setFilterClient(client?.filter((data) => data.deletedAt === null));
    } else {
      const status = () => {
        switch (statusVal) {
          case "active":
            return client?.filter((client) => {
              return client.disable === false;
            });
          case "disable":
            return client?.filter((client) => {
              return client.disable === true;
            });
          case "noAcc":
            return client?.filter((client) => {
              return client.email === null && client.deletedAt === null;
            });
          default:
            return;
        }
      };
      if (statusVal !== "deleted") {
        if (roleSelect.length > 0 && status() !== undefined) {
          const roleFilter = status()?.filter((client) =>
            roleSelect.includes(client.role?.name),
          );
          setFilterClient(roleFilter);
        } else if (roleSelect.length > 0) {
          const roleFilter = client?.filter((client) =>
            roleSelect.includes(client.role?.name),
          );
          setFilterClient(roleFilter);
        } else setFilterClient(status());
      } else {
        setFilterClient(client?.filter((data) => data.deletedAt !== null));
      }
    }
  }, [data, roleSelect, statusVal]);

  return (
    <PageComponent
      name="client"
      page="list"
      translate="clientes"
      translatePage="lista"
      icon={<UsersIcon className="h-full w-full" />}
    >
      <TableElement>
        <TableHead>
          <TableHeadCol>Nombre</TableHeadCol>
          <TableHeadCol>
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
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                                  onChange={(e) => handleRadioChange(e)}
                                  checked={
                                    option.value === statusVal ? true : false
                                  }
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
                                  onChange={(e) => handleRoleChange(e)}
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
          {canUpdate.status && (
            <TableHeadCol>
              <span className="sr-only">Editar</span>
            </TableHeadCol>
          )}
          {canDisable.status ? (
            <TableHeadCol>
              <span className="sr-only">Deshabilitar</span>
            </TableHeadCol>
          ) : (
            canDelete.status && (
              <TableHeadCol>
                <span className="sr-only">Borrar</span>
              </TableHeadCol>
            )
          )}
        </TableHead>
        <TableBody>
          {filterClient?.length === 0 ? (
            <>
              <td colSpan={5} className="h-24 content-center text-center ">
                <span className="text-2xl font-bold">
                  Sin clientes en ese estatus
                </span>
              </td>
            </>
          ) : (
            filterClient
              // ?.filter((data) => data.deletedAt === null)
              ?.map((person) => (
                <TableRow
                  className={classNames(
                    person.disable
                      ? "border-b bg-white dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-900"
                      : "",
                  )}
                  key={person.email}
                >
                  <TableData className="text-sm">
                    <div className="flex">
                      <div className="h-10 w-10 flex-shrink-0">
                        {person.image && (
                          <Image
                            height={140}
                            width={140}
                            className="h-10 w-10 rounded-full"
                            src={person.image}
                            alt=""
                          />
                        )}
                        {person.picture && (
                          <Image
                            height={140}
                            width={calculateWidth(
                              person.picture.width,
                              person.picture.height,
                              140,
                            )}
                            src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                              person.picture ? person.picture.path : ""
                            }/${person.picture ? person.picture.original : ""}`}
                            alt=""
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                      </div>
                      {person.id && canShow.status ? (
                        <Link
                          href={`/admin/clientes/${person.id}`}
                          className="ml-4 font-bold hover:text-black dark:hover:text-white"
                        >
                          <div className="font-medium">{person.name}</div>
                          <div className="">{person.email}</div>
                        </Link>
                      ) : (
                        <div className="ml-4">
                          <div className="font-medium">{person.name}</div>
                          <div className="">{person.email}</div>
                        </div>
                      )}
                    </div>
                  </TableData>

                  <TableData>
                    {person.disable ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 font-semibold capitalize leading-5 text-yellow-800">
                        inhabilitado
                      </span>
                    ) : person.email ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 font-semibold capitalize leading-5 text-green-800">
                        activo
                      </span>
                    ) : person.deletedAt ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 font-semibold capitalize leading-5 text-red-800">
                        borrado
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 font-semibold capitalize leading-5 text-gray-800">
                        sin cuenta
                      </span>
                    )}
                  </TableData>
                  <TableData className="">
                    <span className="mr-2 rounded-full border border-blue-600 px-2.5  py-0.5 font-medium capitalize text-blue-600  dark:border-blue-400 dark:text-blue-400 ">
                      {person?.role?.name}
                    </span>
                  </TableData>
                  {canUpdate.status && (
                    <TableData className="relative text-sm font-medium ">
                      <LinkElement
                        href={`/admin/clientes/${person.id}/editar`}
                        intent="primary"
                        size="sm"
                      >
                        Editar
                      </LinkElement>
                    </TableData>
                  )}
                  {person.deletedAt ? (
                    <TableData>
                      <ButtonElement
                        type="submit"
                        onClick={() => restoreClientHandler(person.id)}
                        intent="blue"
                        size="sm"
                        className="mr-2"
                      >
                        Recuperar
                      </ButtonElement>
                    </TableData>
                  ) : canDelete.status && person.email === null ? (
                    <TableData className="relative text-sm font-medium ">
                      <ButtonElement
                        intent="danger"
                        onClick={() => deleteClientHandler(person.id)}
                        size="sm"
                      >
                        Borrar
                      </ButtonElement>
                    </TableData>
                  ) : canDisable.status ? (
                    <TableData>
                      <ButtonElement
                        type="submit"
                        onClick={() =>
                          disableClientHandler(person.id, person.disable)
                        }
                        intent="blue"
                        size="sm"
                        className="mr-2"
                      >
                        {person.disable ? "Habilitar" : "Deshabilitar"}
                      </ButtonElement>
                    </TableData>
                  ) : (
                    canDelete.status && (
                      <TableData>
                        <span className="sr-only">Sin opciones</span>
                      </TableData>
                    )
                  )}
                </TableRow>
              ))
          )}
        </TableBody>
      </TableElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
