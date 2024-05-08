import { type ReactElement } from "react";
import { useRouter } from "next/router";
import { SwatchIcon } from "@heroicons/react/24/outline";

import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import CreateRoleForm from "~/components/forms/roles/CreateRolesForm";
import EditRoleForm from "~/components/forms/roles/EditRolesForm";
import { AdminLayout } from "~/components/layouts/AdminLayout";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  const { data: role } = trpc.roles.show.useQuery({ id: id as string });
  return (
    <PageComponent
      name="roles"
      page="update"
      translate="roles"
      translatePage="actualizar"
      icon={<SwatchIcon className="h-full w-full" />}
    >
      {!!role && <EditRoleForm />}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
