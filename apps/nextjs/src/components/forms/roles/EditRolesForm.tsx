import { useState } from "react";
import { useRouter } from "next/router";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Permission, Role, RolePermissions } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  updateRoleSchema,
  type UpdateRoleFormValues,
} from "@acme/api/src/schemas/roleSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { translatePermissions } from "~/utils/translation";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";
import PercentageFormController from "../elements/PercentageFormController";
import SelectSimpleElement from "../elements/SelectSimpleElement";

type OrderArray = {
  type: string;
  permissions:
    | (Permission & {
        roles: (RolePermissions & {
          role: Role;
        })[];
      })[]
    | undefined;
}[];

export function capitalized(word: string | undefined) {
  if (word) {
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    return capitalized;
  } else {
    return;
  }
}

export default function EditRoleForm() {
  const session = useSession();
  const utils = trpc.useContext();
  const router = useRouter();
  const { id } = router.query;
  const { data: permissions } = trpc.permissions.all.useQuery();
  const { data: role } = trpc.roles.show.useQuery({ id: id as string });
  const { mutate: updateRole, isLoading: actualizandoRole } =
    trpc.roles.update.useMutation({
      async onSuccess() {
        await utils.roles.all.invalidate(),
          await Toast.fire({
            title: "El rol ha sido editado!",
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
  const defaultPermissions: string[] = role?.permissions.map(
    (p) => p.permission.name,
  ) || [""];
  const [checkedValues, setCheckedValues] =
    useState<string[]>(defaultPermissions);

  const userPermissions = session.data?.user?.permissions;
  const hasSpecial = userPermissions?.some((r) => r.includes("special"));
  const typePermission = [
    ...new Set(
      permissions?.map((per) =>
        per.name
          .replace(
            /(list|access|authorize|show|create|update|delete|order)_/g,
            "",
          )
          .replace(/\_.*/, ""),
      ),
    ),
  ];

  /**
   * Get useForm hook values and functions.
   *
   * @see https://react-hook-form.com/api/useform/
   */
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role?.name,
      type: role?.type,
      discount: role?.discount,
    },
  });
  const roleType = watch("type");

  /**
   * When form is submitted, updates role based on passed data.
   *
   * @param {UpdateRoleFormValues} data
   */
  function submitForm(data: UpdateRoleFormValues) {
    updateRole({
      id: role?.id,
      ...data,
      permissions: checkedValues,
    });
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof UpdateRoleFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof UpdateRoleFormValues): string | undefined {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  /**
   * Sets checkedValues with an array of all selected permissions.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function checkValues(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setCheckedValues([...checkedValues, e.target.value]);
    } else {
      const newArray = checkedValues?.filter((id) => id !== e.target.value);
      setCheckedValues(newArray);
    }
  }

  /**
   * Restructure permissions array of objects to render permissons within their types.
   *
   * @returns {OrderArray} new permissions structure
   */
  function orderArray(): OrderArray {
    if (hasSpecial === true) {
      typePermission.push("special");
      return typePermission
        .map((per) => {
          const obj = {
            type: per,
            permissions: permissions?.filter((permi) => {
              if (per !== "special") {
                return (
                  permi.name.includes(per) && !permi.name.includes("special")
                );
              } else {
                return permi.name.includes(per);
              }
            }),
          };
          return obj;
        })
        .sort((a, b) => {
          return a.type.localeCompare(b.type);
        });
    } else {
      return typePermission
        .map((per) => {
          const obj = {
            type: per,
            permissions: permissions?.filter(
              (permi) =>
                permi.name.includes(per) && !permi.name.includes("special"),
            ),
          };
          return obj;
        })
        .filter((o) => o.type !== "special")
        .sort((a, b) => {
          return a.type.localeCompare(b.type);
        });
    }
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Nombre"
        {...register("name")}
        error={getError("name")}
      />
      {/* <SelectSimpleElement
        // @ts-expect-error TODO: fix this
        control={control}
        nombre="Tipo"
        name="type"
        data={["team", "client"]}
        error={getError("type")}
      /> */}

      {roleType === "team" ? (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
            Permisos
          </label>
          <div className="flex flex-wrap">
            {orderArray().map((per) => (
              <div key={per.type} className="w-80  p-6">
                <h1 className="mb-3 capitalize">
                  {translatePermissions(per.type)}
                </h1>
                {per.permissions?.map((p, i) => (
                  <div key={i} className="mb-4 flex items-center">
                    <input
                      id="permissions"
                      type="checkbox"
                      value={p.name}
                      onChange={(e) => checkValues(e)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      defaultChecked={defaultPermissions.includes(p.name)}
                    />
                    <label
                      htmlFor="default-checkbox"
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {p.name
                        .split(/[_]+/)
                        .filter((e) => e !== "special")
                        .map(
                          (per) =>
                            `${
                              capitalized(translatePermissions(per)) as string
                            } `,
                        )}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PercentageFormController
          // @ts-expect-error TODO: fix this
          control={control}
          name="discount"
          nombre="Descuento"
          error={getError("discount")}
        />
      )}
      <LinkElement
        href={`/admin/roles`}
        size="sm"
        intent="primary"
        className="mr-2"
      >
        Volver
      </LinkElement>
      {!actualizandoRole && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {actualizandoRole && (
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
