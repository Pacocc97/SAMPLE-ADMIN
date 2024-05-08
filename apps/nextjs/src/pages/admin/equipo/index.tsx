import { Fragment, useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import SideFormElement from "~/components/forms/elements/SideFormElement";
import EditTeamForm from "~/components/forms/team/EditTeamForm";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import { env } from "~/env.mjs";

export default function Page() {
  const session = useSession();
  const utils = trpc.useContext();
  const canShow = hasPermission(session.data, "show_user");
  const canUpdate = hasPermission(session.data, "update_team");
  const canDisable = hasPermission(session.data, "disable_team");
  const { data } = trpc.users.all.useQuery();
  const [open, setOpen] = useState(false);
  const [idEdit, setIdEdit] = useState<User>();
  const [roleSelect, setRoleSelect] = useState<Array<string | undefined>>([]);
  const [statusVal, setStatusVal] = useState<string>("");

  const [filterTeam, setFilterTeam] = useState(
    data?.filter((data) => data?.role?.type === "team"),
  );

  const { mutate: updateTeam } = trpc.users.disable.useMutation({
    async onSuccess() {
      await utils.users.all.invalidate();
      // await Toast.fire({
      //   title: 'El cliente ha sido actualizado!',
      //   icon: 'success',
      // });
    },
  });

  const filters = [
    {
      id: "rol",
      name: "rol",
      options: [
        {
          value: "admin",
          label: "Administrador",
          checked: roleSelect.includes("admin"),
        },
        {
          value: "editor",
          label: "Editor",
          checked: roleSelect.includes("editor"),
        },
        {
          value: "seo",
          label: "SEO",
          checked: roleSelect.includes("seo"),
        },
        {
          value: "diseñador",
          label: "Diseñador",
          checked: roleSelect.includes("diseñador"),
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
      ],
    },
  ];

  /**
   * Handles radio input change.
   * setState to render based on user role.
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

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function disableTeamHandler(id: string, disable: boolean | null) {
    if (disable === false) {
      await ConfirmModal.fire({
        text: "Esta acción deshabilitará al usuario!",

        confirmButtonText: "Sí, seguir!",
      }).then((result) => {
        if (result.isConfirmed) {
          updateTeam({ id, disable: !disable });
        }
      });
    } else if (disable === true) updateTeam({ id, disable: !disable });
    else return;
  }

  useEffect(() => {
    const team = data?.filter((data) => data?.role?.type === "team");
    if (roleSelect.length === 0 && statusVal === "") {
      setFilterTeam(team);
    } else {
      const status = () => {
        switch (statusVal) {
          case "active":
            return team?.filter((team) => {
              return team.disable === false;
            });
          case "disable":
            return team?.filter((team) => {
              return team.disable === true;
            });
          default:
            return;
        }
      };
      if (roleSelect.length > 0 && status() !== undefined) {
        const roleFilter = status()?.filter((team) =>
          roleSelect.includes(team.role?.name),
        );
        setFilterTeam(roleFilter);
      } else if (roleSelect.length > 0) {
        const roleFilter = team?.filter((team) =>
          roleSelect.includes(team.role?.name),
        );
        setFilterTeam(roleFilter);
      } else setFilterTeam(status());
    }
  }, [data, roleSelect, statusVal]);

  /**
   * Returns translated word based on passed value.
   *
   * @param {string | undefined} value
   * @returns
   */
  function translate(value: string | undefined) {
    switch (value) {
      case "admin":
        return "administrador";
      default:
        return value;
    }
  }

  return (
    <PageComponent
      name="user"
      page="list"
      translate="equipo"
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
          {canDisable.status && (
            <TableHeadCol>
              <span className="sr-only">Borrar</span>
            </TableHeadCol>
          )}
        </TableHead>
        <TableBody>
          {filterTeam?.length === 0 ? (
            <>
              <td colSpan={5} className="h-24 content-center text-center ">
                <span className="text-2xl font-bold">
                  Sin equipo en ese estatus
                </span>
              </td>
            </>
          ) : (
            filterTeam?.map((person) => (
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
                      {!person.picture && person.image && (
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
                    {person.email && canShow.status ? (
                      <Link
                        href={`/admin/equipo/${person.id}`}
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

                <TableData className="">
                  {person.disable ? (
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 font-semibold capitalize leading-5 text-yellow-800">
                      inhabilitado
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-100 px-2 font-semibold capitalize leading-5 text-green-800">
                      activo
                    </span>
                  )}
                </TableData>
                <TableData className="">
                  <span className="mr-2 rounded-full border border-blue-600 px-2.5  py-0.5 font-medium capitalize text-blue-600  dark:border-blue-400 dark:text-blue-400 ">
                    {translate(person?.role?.name)}
                  </span>
                </TableData>
                {canUpdate.status && session.data?.user?.id !== person.id ? (
                  <TableData className="relative text-sm font-medium ">
                    <ButtonElement
                      onClick={() => (setIdEdit(person), setOpen(true))}
                      intent="primary"
                      size="sm"
                    >
                      Editar
                    </ButtonElement>
                  </TableData>
                ) : (
                  <TableData>
                    <span className="sr-only">Sin opciones disponibles</span>
                  </TableData>
                )}
                {canDisable.status && session.data?.user?.id !== person.id ? (
                  <TableData>
                    <ButtonElement
                      type="submit"
                      onClick={() =>
                        disableTeamHandler(person.id, person.disable)
                      }
                      intent="blue"
                      size="sm"
                      className="mr-2"
                    >
                      {person.disable ? "Habilitar" : "Deshabilitar"}
                    </ButtonElement>
                  </TableData>
                ) : (
                  <TableData>
                    <span className="sr-only">Sin opciones disponibles</span>
                  </TableData>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </TableElement>
      <SideFormElement show={open} onClose={setOpen}>
        <PageComponent
          name="team"
          page="update"
          translate="equipo"
          translatePage="actualizar"
          manualResponsive={false}
          icon={<UserCircleIcon className="h-full w-full" />}
        >
          {!!idEdit && <EditTeamForm team={idEdit} />}
        </PageComponent>
      </SideFormElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
