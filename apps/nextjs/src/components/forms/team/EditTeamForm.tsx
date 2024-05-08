import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { useForm } from "react-hook-form";

import {
  createUserFormSchema,
  type CreateUserFormValues,
} from "@acme/api/src/schemas/userSchema";

import { Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import TextFormElement from "~/components/forms/elements/TextFormElement";
import ButtonElement from "~/components/ui/ButtonElement";
import Spinner from "~/components/ui/Spinner";
import SelectFormElement from "../elements/SelectFormElement";

export default function EditTeamForm({ team }: { team: User }) {
  const utils = trpc.useContext();

  const roleData = trpc.roles.all.useQuery();
  const role = roleData.data
    ?.filter((r) => r.type === "team")
    .map((role) => ({
      id: role.id,
      name: role.name,
    }));

  const { mutate: updateTeam, isLoading: subiendoTeam } =
    trpc.users.update.useMutation({
      async onSuccess() {
        await utils.users.all.invalidate();
        await Toast.fire({
          title: "El usuario ha sido actualizado!",
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: team.name || undefined,
      contactMails: team.contactMails,
      contactPhones: team.contactPhones,
      rol: team.roleId || undefined,
    },
  });

  /**
   * When form is submitted, updates categoría based on passed data.
   *
   * @param {CreateUserFormValues} data
   */
  function submitForm(data: CreateUserFormValues) {
    updateTeam({
      id: team.id,
      userType: "team",
      ...data,
    });
  }

  /**
   * If form gets any input error, passes that field and returns error message.
   *
   * @param {keyof CreateUserFormValues} field
   * @returns {string | undefined} error message (only in case of error)
   */
  function getError(field: keyof CreateUserFormValues) {
    if (errors[field]) {
      return errors[field]?.message;
    }
    return undefined;
  }

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <TextFormElement
        label="Nombre"
        {...register("name")}
        error={getError("name")}
        disabled
      />

      <SelectFormElement
        // @ts-expect-error TODO: fix this
        control={control}
        nombre="Rol"
        name="rol"
        error={getError("rol")}
        data={role}
        canCreate={false}
      />
      {!subiendoTeam && (
        <ButtonElement type="submit" intent="primary">
          Subir
        </ButtonElement>
      )}
      {subiendoTeam && (
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
