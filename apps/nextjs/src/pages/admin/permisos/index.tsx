import { Fragment, type ReactElement } from "react";
import { LockOpenIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";

import { translatePermissions } from "~/utils/translation";
import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";

/**
 * Capitalize words first letter.
 *
 * @param {string | undefined} word
 * @returns {string | undefined} word with first capital letter
 */
export function capitalized(word: string | undefined): string | undefined {
  if (word) {
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    return capitalized;
  } else {
    return;
  }
}

export default function Page() {
  const { data: permissions } = trpc.permissions.all.useQuery();
  const { data: roles } = trpc.roles.all.useQuery();

  const typePermission = [
    ...new Set(
      permissions?.map((per) =>
        per.name
          .replace(/(list|access|authorize|show|create|update|delete)_/g, "")
          .replace(/\_.*/, ""),
      ),
    ),
  ];

  const orderArray = typePermission
    .map((per) => {
      const obj = {
        type: per,
        permissions: permissions?.filter((permi) => permi.name.includes(per)),
      };
      return obj;
    })
    .sort((a, b) => {
      return a.type.localeCompare(b.type);
    });

  return (
    <PageComponent
      name="permissions"
      page="list"
      translate="permisos"
      translatePage="lista"
      hasData={permissions && permissions.length > 0}
      icon={<LockOpenIcon className="h-full w-full" />}
    >
      <TableElement>
        <TableHead>
          <TableHeadCol>nombre</TableHeadCol>
          {roles && <TableHeadCol>roles</TableHeadCol>}
        </TableHead>
        <TableBody>
          {orderArray.sort()?.map((permission, idx) => (
            <Fragment key={idx}>
              <TableRow className="bg-slate-100 dark:bg-slate-600">
                <TableData className="font-bold text-black dark:text-white">
                  <p className="font-bold text-black dark:text-white">
                    {translatePermissions(permission.type)?.toUpperCase()}{" "}
                  </p>
                </TableData>
                {roles && (
                  <TableData>
                    <span className="sr-only">Roles</span>
                  </TableData>
                )}
              </TableRow>

              {permission.permissions?.map((permission, idx) => (
                <TableRow key={idx}>
                  <TableData className="font-bold hover:text-black dark:hover:text-white">
                    <p className="ml-5 font-bold hover:text-black dark:hover:text-white">
                      {permission.name
                        .split(/[_]+/)
                        .map(
                          (per) =>
                            `${
                              capitalized(translatePermissions(per)) as string
                            } `,
                        )}
                    </p>
                  </TableData>
                  <TableData className="text-base">
                    <ul>
                      {permission.roles.map(({ role }) => (
                        <li
                          key={role.id}
                          className="list-disc text-xs font-medium"
                        >
                          {role.name.toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </TableData>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </TableElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
